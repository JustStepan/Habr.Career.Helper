from typing import List
from fastapi import HTTPException, Depends, APIRouter
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import FavoriteRequest, FavoriteVacancyResponse
from app.logger_config import logger

from sqlalchemy.ext.asyncio import AsyncSession

from app.db_models import Vacancy, FavoriteVacancy, User, favorite_vacancy_skills
from app.routes.auth import get_current_user


router = APIRouter(tags=["favorite_crud"])


@router.delete("/favorite")
async def delete_from_favorite(
    request: FavoriteRequest,
    db: AsyncSession = Depends(get_db)
):
    print(request.favorite_id)
    query = await db.execute(
        select(FavoriteVacancy)
        .options(selectinload(FavoriteVacancy.skills))
        .where(FavoriteVacancy.id == request.favorite_id)
    )
    favorite_vacancy = query.scalar_one_or_none()

    if not favorite_vacancy:
        raise HTTPException(404, "Вакансия не найдена")

    await db.delete(favorite_vacancy)
    await db.commit()
    logger.info(f"Вакансия {request.favorite_id} удалена.")

    return {"result": True}

@router.post("/favorite", response_model=FavoriteVacancyResponse, status_code=201)
async def add_to_favorites(
    request: FavoriteRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # 1. Найти вакансию
    result = await db.execute(
        select(Vacancy)
        .options(selectinload(Vacancy.skills))
        .where(Vacancy.id == request.favorite_id)
    )
    vacancy = result.scalar_one_or_none()
    
    if not vacancy:
        raise HTTPException(404, "Вакансия не найдена")
    
    # 2. Проверить дубликат
    existing = await db.execute(
        select(FavoriteVacancy).where(
            FavoriteVacancy.owner_id == user.id,
            FavoriteVacancy.original_vacancy_id == vacancy.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Вакансия уже в избранном")
    
    logger.info(f'Вакансия {vacancy.id} найдена начинаем процесс копирования')
    
    # 3. Создать копию вакансии
    favorite_vacancy = FavoriteVacancy(
        owner_id=user.id,
        original_vacancy_id=vacancy.id,
        level=vacancy.level,
        title=vacancy.title,
        company=vacancy.company,
        url=vacancy.url,
        salary=vacancy.salary,
        description=vacancy.description,
        published_date=vacancy.published_date,
    )
    
    db.add(favorite_vacancy)
    await db.flush()
    
    # 4. Копировать скиллы вручную
    for skill in vacancy.skills:
        stmt = favorite_vacancy_skills.insert().values(
            favorite_vacancy_id=favorite_vacancy.id,
            skill_id=skill.id
        )
        await db.execute(stmt)
    
    await db.commit()
    
    # 5. Загрузить финальный объект
    result = await db.execute(
        select(FavoriteVacancy)
        .options(selectinload(FavoriteVacancy.skills))
        .where(FavoriteVacancy.id == favorite_vacancy.id)
    )
    logger.info(f'Любимая вакансия {favorite_vacancy.id} создана в БД.')
    
    return result.scalar_one()

@router.get("/favorite", response_model=List[FavoriteVacancyResponse])
async def get_my_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):  
    result = await db.execute(
        select(FavoriteVacancy)
        .options(selectinload(FavoriteVacancy.skills))
        .where(FavoriteVacancy.owner_id == current_user.id)
        .order_by(FavoriteVacancy.added_at.desc())
    )

    favorites = result.scalars().all()
    return favorites
