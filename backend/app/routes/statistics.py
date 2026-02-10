from datetime import timedelta 

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func
from datetime import date
from sqlalchemy.orm import selectinload

from app.db_models import Skill, vacancy_skills
from app.database import get_db
from app.db_models import Vacancy
from app.logger_config import logger

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    """
    Базовая статистика: количество вакансий
    
    Возвращает:
    - total_vacancies: всего в БД
    - active_vacancies: с is_active=true
    - new_today: опубликованные сегодня
    """
    logger.info('START')
    # Всего вакансий
    total = await db.scalar(select(func.count(Vacancy.id)))
    
    # Активные вакансии
    active = await db.scalar(
        select(func.count(Vacancy.id)).where(Vacancy.is_active == True)
    )
    
    # Новые за сегодня
    today = date.today()
    new_today = await db.scalar(
        select(func.count(Vacancy.id))
        .where(func.date(Vacancy.published_date) == today)
    )
    
    return {
        "total_vacancies": total,
        "active_vacancies": active,
        "new_today": new_today
    }


@router.get("/skills")
async def get_top_skills(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    Топ навыков по количеству вакансий
    
    Параметры:
    - limit: сколько навыков вернуть (по умолчанию 20)
    
    Возвращает:
    [
        {"name": "Python", "count": 150},
        {"name": "React", "count": 120},
        ...
    ]
    """
    
    # SQL запрос с подсчетом через промежуточную таблицу
    query = (
        select(
            Skill.name,
            func.count(vacancy_skills.c.vacancy_id).label('count')
        )
        .join(vacancy_skills, Skill.id == vacancy_skills.c.skill_id)
        .join(Vacancy, vacancy_skills.c.vacancy_id == Vacancy.id)
        .where(Vacancy.is_active == True)  # Только активные вакансии
        .group_by(Skill.id, Skill.name)
        .order_by(desc('count'))
        .limit(limit)
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    # Преобразуем в список словарей
    return [
        {"name": row.name, "count": row.count}
        for row in rows
    ]


@router.get("/levels")
async def get_levels_distribution(db: AsyncSession = Depends(get_db)):
    """
    Распределение вакансий по уровням квалификации
    
    Возвращает:
    [
        {"level": "Junior", "count": 150},
        {"level": "Middle", "count": 250},
        ...
    ]
    """
    
    # SQL: GROUP BY level, COUNT(*)
    query = (
        select(
            Vacancy.level,
            func.count(Vacancy.id).label('count')
        )
        .where(Vacancy.is_active == True)  # Только активные
        .group_by(Vacancy.level)
        .order_by(desc('count'))  # Сортируем от большего к меньшему
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {"level": row.level, "count": row.count}
        for row in rows
    ]

@router.get("/timeline")
async def get_timeline(
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """
    Динамика публикаций вакансий по дням
    
    Параметры:
    - days: за сколько дней показать (по умолчанию 30)
    
    Возвращает:
    [
        {"date": "2025-01-15", "count": 25},
        {"date": "2025-01-16", "count": 30},
        ...
    ]
    """
    
    # Дата начала периода
    start_date = date.today() - timedelta(days=days)
    
    # SQL: GROUP BY дата, COUNT(*)
    query = (
        select(
            func.date(Vacancy.published_date).label('date'),
            func.count(Vacancy.id).label('count')
        )
        .where(Vacancy.published_date >= start_date)
        .group_by(func.date(Vacancy.published_date))
        .order_by('date')  # От старых к новым
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {
            "date": row.date.strftime('%Y-%m-%d'),  # Форматируем дату
            "count": row.count
        }
        for row in rows
    ]