"""
Production-ready async vacancy search with LLM ranking.
"""

from datetime import datetime, timedelta
from typing import TypedDict, List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db_models import Vacancy, Skill
from app.models import VacancyResponse
from app.llm_search.tools import llm_rank_vacancies


# Константы для каскадной выборки
DAYS_LIMIT = 20
INITIAL_LIMIT = 40
LIMIT_DECAY = 0.7
MIN_LIMIT = 5


@dataclass(frozen=True)
class VacancyMatch:
    """Результат сопоставления вакансии со скиллами."""
    vacancy: Vacancy
    match_count: int
    match_ratio: float  # Отношение совпавших скиллов к запрошенным


@dataclass(frozen=True)
class SearchResult:
    """Результат поиска вакансий."""
    primary: Optional[Dict[str, Any]]
    secondary: Optional[Dict[str, Any]]
    total_found: int
    match_stats: Dict[str, Any]


async def fetch_vacancies_by_skills(
    db: AsyncSession,
    skills: List[str],
    level: str,
    days_limit: int = DAYS_LIMIT
) -> List[Vacancy]:
    """
    Асинхронно получает вакансии с совпадающими скиллами.
    
    Args:
        db: Асинхронная сессия БД
        skills: Список скиллов для поиска
        level: Уровень вакансии
        days_limit: Ограничение по дате публикации (дни)
    
    Returns:
        Список вакансий с загруженными скиллами
    """
    if not skills:
        return []
    
    date_threshold = datetime.now() - timedelta(days=days_limit)
    skills_lower = [s.lower() for s in skills]
    
    query = (
        select(Vacancy)
        .options(selectinload(Vacancy.skills))
        .where(Vacancy.level == level)
        .where(Vacancy.published_date > date_threshold)
        .where(Vacancy.is_active == True)
        .where(
            Vacancy.skills.any(
                func.lower(Skill.name).in_(skills_lower)
            )
        )
        .order_by(Vacancy.published_date.desc())
        .distinct()
    )
    
    result = await db.execute(query)
    return list(result.scalars().all())


def calculate_match_scores(
    vacancies: List[Vacancy],
    target_skills: List[str]
) -> List[VacancyMatch]:
    """
    Вычисляет скоры сопоставления для вакансий.
    
    Args:
        vacancies: Список вакансий
        target_skills: Целевые скиллы
    
    Returns:
        Список VacancyMatch с рассчитанными скорами
    """
    if not target_skills:
        return []
    
    skills_set = {s.lower() for s in target_skills}
    total_skills = len(skills_set)
    matches = []
    
    for vacancy in vacancies:
        vacancy_skills = {s.name.lower() for s in vacancy.skills}
        match_count = len(vacancy_skills & skills_set)
        match_ratio = match_count / total_skills if total_skills > 0 else 0
        
        matches.append(VacancyMatch(
            vacancy=vacancy,
            match_count=match_count,
            match_ratio=match_ratio
        ))
    
    return matches


def sort_vacancies_by_priority(matches: List[VacancyMatch]) -> List[VacancyMatch]:
    """
    Сортирует вакансии по приоритету:
    1. Количество совпадений (desc)
    2. Republish count (asc)
    3. Дата публикации (desc)
    """
    def sort_key(match: VacancyMatch) -> Tuple:
        v = match.vacancy
        return (
            -match.match_count,  # Больше совпадений = лучше
            v.republish_count or 0,  # Меньше republish = лучше
            -(v.published_date.timestamp() if v.published_date else 0)
        )
    
    return sorted(matches, key=sort_key)


def apply_cascade_selection(
    sorted_matches: List[VacancyMatch],
    initial_limit: int = INITIAL_LIMIT,
    decay: float = LIMIT_DECAY,
    min_limit: int = MIN_LIMIT
) -> List[Vacancy]:
    """
    Применяет каскадную выборку вакансий.
    
    На каждом уровне совпадений лимит уменьшается,
    что позволяет взять больше вакансий с высоким совпадением.
    """
    if not sorted_matches:
        return []
    
    # Группировка по уровню совпадений
    by_match_count: Dict[int, List[VacancyMatch]] = {}
    for match in sorted_matches:
        count = match.match_count
        if count not in by_match_count:
            by_match_count[count] = []
        by_match_count[count].append(match)
    
    # Каскадная выборка
    max_match = max(by_match_count.keys()) if by_match_count else 0
    selected = []
    limit = initial_limit
    
    for match_level in range(max_match, 0, -1):
        candidates = by_match_count.get(match_level, [])
        chunk = candidates[:limit]
        selected.extend([m.vacancy for m in chunk])
        
        limit = max(min_limit, int(limit * decay))
    
    return selected


def convert_to_dict(vacancy: Vacancy) -> Dict[str, Any]:
    """Конвертирует вакансию в словарь для LLM."""
    desc = vacancy.description or ""
    return {
        "id": vacancy.id,
        "title": vacancy.title,
        "company": vacancy.company,
        "level": vacancy.level,
        "salary": vacancy.salary,
        "description": desc[:500] if desc else "",
        "skills": [s.name for s in vacancy.skills],
        "republish_count": vacancy.republish_count or 0,
        "published_date": vacancy.published_date.isoformat() if vacancy.published_date else None
    }


async def search_best_vacancies(
    db: AsyncSession,
    user_query: str,
    skills: List[str],
    level: str
) -> SearchResult:
    """
    Основная функция поиска лучших вакансий.
    
    Args:
        db: Асинхронная сессия БД
        user_query: Запрос пользователя
        skills: Список скиллов
        level: Уровень вакансии
    
    Returns:
        SearchResult с primary и secondary вакансиями
    """
    # 1. Получаем вакансии из БД
    vacancies = await fetch_vacancies_by_skills(db, skills, level)
    
    if not vacancies:
        return SearchResult(
            primary=None,
            secondary=None,
            total_found=0,
            match_stats={"message": "No vacancies found"}
        )
    
    # 2. Вычисляем скоры сопоставления
    matches = calculate_match_scores(vacancies, skills)
    
    # 3. Сортируем по приоритету
    sorted_matches = sort_vacancies_by_priority(matches)
    
    # 4. Каскадная выборка
    selected = apply_cascade_selection(sorted_matches)
    
    if not selected:
        return SearchResult(
            primary=None,
            secondary=None,
            total_found=len(vacancies),
            match_stats={"candidates_before_filter": len(vacancies)}
        )
    
    # 5. Если только 1 вакансия - возвращаем её
    if len(selected) == 1:
        primary_dict = convert_to_dict(selected[0])
        return SearchResult(
            primary=primary_dict,
            secondary=None,
            total_found=1,
            match_stats={"single_match": True}
        )
    
    # 6. Конвертируем в словари для LLM
    vacancy_dicts = [convert_to_dict(v) for v in selected]
    
    # 7. LLM ранжирование - получаем топ-2
    rankings = await llm_rank_vacancies(
        vacancies=vacancy_dicts,
        query=user_query,
        skills=skills,
        top_n=2
    )
    
    if not rankings:
        # Fallback: берём первые 2 по нашему скорингу
        primary = convert_to_dict(selected[0])
        secondary = convert_to_dict(selected[1]) if len(selected) > 1 else None
        return SearchResult(
            primary=primary,
            secondary=secondary,
            total_found=len(selected),
            match_stats={"llm_fallback": True, "candidates": len(selected)}
        )
    
    # 8. Формируем результат
    primary_id = rankings[0] if len(rankings) > 0 else None
    secondary_id = rankings[1] if len(rankings) > 1 else None
    
    primary = next((v for v in vacancy_dicts if v["id"] == primary_id), None)
    secondary = next((v for v in vacancy_dicts if v["id"] == secondary_id), None)
    
    # Статистика совпадений
    match_stats = {
        "total_candidates": len(vacancies),
        "after_cascade": len(selected),
        "primary_match_score": next(
            (m.match_ratio for m in sorted_matches if m.vacancy.id == primary_id),
            0
        ) if primary_id else 0,
        "secondary_match_score": next(
            (m.match_ratio for m in sorted_matches if m.vacancy.id == secondary_id),
            0
        ) if secondary_id else 0
    }
    
    return SearchResult(
        primary=primary,
        secondary=secondary,
        total_found=len(selected),
        match_stats=match_stats
    )


async def quick_search(
    db: AsyncSession,
    skills: List[str],
    level: str,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Быстрый поиск без LLM ранжирования.
    Используется для простых запросов.
    """
    vacancies = await fetch_vacancies_by_skills(db, skills, level)
    matches = calculate_match_scores(vacancies, skills)
    sorted_matches = sort_vacancies_by_priority(matches)
    
    return [convert_to_dict(m.vacancy) for m in sorted_matches[:limit]]
