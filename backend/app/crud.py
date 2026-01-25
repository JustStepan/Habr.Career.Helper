from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db_models import Vacancy, Skill
from typing import List, Optional



async def get_or_create_skill(db: AsyncSession, skill_name: str) -> Skill:
    """Получить существующий скилл или создать новый"""
    result = await db.execute(
        select(Skill).where(Skill.name == skill_name)
    )
    skill = result.scalar_one_or_none()

    if not skill:
        skill = Skill(name=skill_name)
        db.add(skill)
        await db.flush()

    return skill


async def get_vacancy_by_id(db: AsyncSession, vac_id: int):
    query = (
        select(Vacancy)
        .where(Vacancy.id == vac_id)
        .options(selectinload(Vacancy.skills))
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def vacancy_url_exists(db: AsyncSession, url: str) -> bool:
    """Проверить, существует ли вакансия с таким URL"""
    result = await db.execute(
        select(Vacancy.id).where(Vacancy.url == url)
    )
    return result.scalar_one_or_none() is not None

# async def vacancy_exists(db: AsyncSession, url: str) -> bool:
#     """Проверить, существует ли вакансия с таким URL"""
#     result = await db.execute(
#         select(Vacancy.id).where(Vacancy.url == url)
#     )
#     return result.scalar_one_or_none() is not None


async def create_vacancy_with_skills(
    db: AsyncSession,
    vacancy_data: dict,
    skills_list: List[str]
) -> Optional[Vacancy]:
    """Создать вакансию со скиллами. Возвращает None если вакансия уже существует."""

    # 1. Проверяем, есть ли уже такая вакансия
    if await vacancy_url_exists(db, vacancy_data['url']):
        return None

    # 3. Создаём вакансию
    vacancy = Vacancy(**vacancy_data)
    db.add(vacancy)
    await db.flush()

    # 4. Собираем скиллы
    skill_objects = []
    for skill_name in skills_list:
        skill = await get_or_create_skill(db, skill_name.strip())
        skill_objects.append(skill)

    # 5. Загружаем vacancy с relationship, чтобы избежать lazy load
    await db.refresh(vacancy, attribute_names=['skills'])

    # 6. Присваиваем скиллы
    vacancy.skills = skill_objects

    # 7. Коммитим
    await db.commit()

    # 8. Загружаем relationship из БД
    # await db.refresh(vacancy, attribute_names=['skills'])

    return vacancy