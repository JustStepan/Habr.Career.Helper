from typing import List

from fastapi import APIRouter, HTTPException, Depends, Path, Query

from app.database import get_db
from app.crud import get_vacancy_by_id
from app.models import SearchVacanciesResponse, VacancyResponse, VacanciesDBRequest
from app.db_models import Vacancy, Skill, User, FavoriteVacancy

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func
from sqlalchemy.orm import selectinload

from app.routes.auth import get_current_user_soft_auth


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
    # Ищем пользователя используем soft auth
    favorites_map = {}
    if user:
        query = await db.execute(select(User).where(User.id == user.id).options(selectinload(User.favorite_vacancies)))
        user = query.scalar_one_or_none()
        favorites_map = {u.original_vacancy_id: u.id for u in user.favorite_vacancies}

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
    limit: int = 10,
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