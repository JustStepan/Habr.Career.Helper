from typing import List

from fastapi import APIRouter, HTTPException, Depends, Path, Query

from app.database import get_db
from app.crud import get_vacancy_by_id
from app.db_models import Vacancy, Skill, User, FavoriteVacancy

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func
from sqlalchemy.orm import selectinload

from app.routes.auth import get_current_user_soft_auth, get_current_user
from app.models import (
    SearchVacanciesResponse, 
    VacancyResponse, 
    VacanciesDBRequest,
    LLMSearchRequest,
    LLMSearchResponse,
    LLMVacancyResult
)
from app.llm_search.search_engine import search_best_vacancies


router = APIRouter(tags=["crud"])


@router.get("/vacancy/{vac_id}", response_model=VacancyResponse)
async def get_vacancy(
    vac_id: int = Path(..., gt=0, description="ID вакансии"),
    db: AsyncSession = Depends(get_db)
):
    vacancy = await get_vacancy_by_id(db, vac_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return vacancy


@router.post("/vacancies", response_model=SearchVacanciesResponse)
async def get_vacancies(
    request: VacanciesDBRequest,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user_soft_auth)
):
    # Загружаем только ID избранных вакансий (оптимизация N+1)
    favorites_map = {}
    if user:
        result = await db.execute(
            select(FavoriteVacancy.original_vacancy_id, FavoriteVacancy.id)
            .where(FavoriteVacancy.owner_id == user.id)
        )
        favorites_map = {row[0]: row[1] for row in result.all()}

    # Базовый запрос
    query = select(Vacancy).options(selectinload(Vacancy.skills))

    # Фильтр по дате
    if request.date_limit:
        query = query.where(Vacancy.published_date >= request.date_limit)

    # Фильтр по уровню
    if request.level:
        query = query.where(Vacancy.level == request.level)

    # Фильтр по skills (самое интересное!)
    if request.skills:
        skills_list = [s.strip() for s in request.skills.split(",")]
        
        # 1. Находим IDs существующих skills
        result = await db.execute(
            select(Skill.id).where(func.lower(Skill.name).in_([s.lower() for s in skills_list]))
        )
        skill_ids = result.scalars().all()
        
        # 2. Фильтруем вакансии (AND логика - все skills должны быть)
        for skill_id in skill_ids:
            query = query.where(
                Vacancy.skills.any(Skill.id == skill_id)
            )

    # Пагинация в конце и сортиовка по дате!
    query = query.order_by(desc(Vacancy.published_date)).offset(skip).limit(limit)
    
    result = await db.execute(query)
    vacancies = result.scalars().all()
    return {'vacancies': vacancies,
            'favorites_map': favorites_map}


@router.get("/skills/search", response_model=List[str])
async def search_skills(
    query: str = Query(..., min_length=1),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Поиск навыков по началу названия
    """
    result = await db.execute(
        select(Skill.name)
        .where(func.lower(Skill.name).startswith(query.lower()))
        .distinct()
        .limit(limit)
    )
    skills = result.scalars().all()
    return skills


@router.post("/llm-search", response_model=LLMSearchResponse)
async def llm_search_vacancies(
    request: LLMSearchRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    print('request')
    """
    LLM-powered поиск вакансий.
    
    Принимает запрос пользователя, скиллы и уровень.
    Возвращает primary (лучшую) и secondary (вторую) вакансии.
    """
    result = await search_best_vacancies(
        db=db,
        user_query=request.user_query,
        skills=request.skills,
        level=request.level
    )
    
    # Конвертируем результат в response model
    primary = None
    secondary = None
    
    if result.primary:
        primary = LLMVacancyResult(
            id=result.primary["id"],
            title=result.primary["title"],
            company=result.primary["company"],
            level=result.primary["level"],
            salary=result.primary.get("salary", ""),
            match_score=result.match_stats.get("primary_match_score", 0.0),
            skills=result.primary.get("skills", [])[:10]
        )
    
    if result.secondary:
        secondary = LLMVacancyResult(
            id=result.secondary["id"],
            title=result.secondary["title"],
            company=result.secondary["company"],
            level=result.secondary["level"],
            salary=result.secondary.get("salary", ""),
            match_score=result.match_stats.get("secondary_match_score", 0.0),
            skills=result.secondary.get("skills", [])[:10]
        )
    
    return LLMSearchResponse(
        primary=primary,
        secondary=secondary,
        total_found=result.total_found,
        search_stats=result.match_stats
    )