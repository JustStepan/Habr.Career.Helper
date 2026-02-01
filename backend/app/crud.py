from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from sqlalchemy.orm import selectinload

from app.db_models import ParsingJob, Vacancy, Skill
from app.logger_config import logger


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

async def get_vacancy_by_url_or_none(db: AsyncSession, url: str) -> Vacancy | None:
    """Проверить, существует ли вакансия с таким URL"""
    result = await db.execute(
        select(Vacancy).where(Vacancy.url == url)
    )
    return result.scalar_one_or_none()


async def update_vacancy_if_changed(db: AsyncSession, vacancy: Vacancy, new_vacancy_data: dict) -> bool:
    """Обновляет вакансию если данные изменились. Возвращает True если были изменения."""

    changed = False

    for key, value in new_vacancy_data.items():
        if hasattr(vacancy, key) and getattr(vacancy, key) != value:
            if key == 'description':
                logger.info(f'Вакансия изменилась. Новый параметр - {key}:\n{getattr(vacancy, key)[:100]} --> {value[:100]}')
                setattr(vacancy, key, value)
            else:
                logger.info(f'Вакансия изменилась. Новый параметр - {key}:\n{getattr(vacancy, key)} --> {value}')
                setattr(vacancy, key, value)
            changed = True
    if changed:
        vacancy.republish_count += 1
        logger.info(f'Вакансия {vacancy.id} опубликована снова (счетчик: {vacancy.republish_count})')
        await db.commit() 
        
    return changed

async def create_vacancy_with_skills(
    db: AsyncSession,
    vacancy_data: dict,
    skills_list: List[str]
) -> Optional[Vacancy]:
    """Создать вакансию со скиллами. Возвращает None если вакансия уже существует."""
    logger.info(f"Создание вакансии: {vacancy_data.get('title')}")

    # 1. Проверяем, есть ли уже такая вакансия
    is_vacancy = await get_vacancy_by_url_or_none(db, vacancy_data['url'])
    if is_vacancy:
        if not await update_vacancy_if_changed(db, is_vacancy, vacancy_data):  # фиксируем были ли в ней изменения? ДА, время размещения по крайней мере.
            logger.info(f"Ваканссия {is_vacancy.id}: '{is_vacancy.title}' уже в БД(пролный повтор).")
        return None

    logger.info(f"Проверка на вакансию пройдена. Приступаем к созданию вакансии.")
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
    logger.info(f'Вакансия {vacancy.title} ({vacancy.id}) сохранена в БД.')

    return vacancy


async def create_parsing_job(db: AsyncSession) -> ParsingJob:
    """Создает запись о начале парсинга"""
    parse_job = ParsingJob()
    db.add(parse_job)
    await db.commit()
    await db.refresh(parse_job)
    return parse_job


async def get_latest_parsing_job(db: AsyncSession) -> Optional[ParsingJob]:
    """Получает последнюю запись о парсинге"""
    result = await db.execute(
        select(ParsingJob)
        .order_by(desc(ParsingJob.started_at))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_latest_vacancy_urls(db: AsyncSession, limit: int = 20) -> List[str]:
    """Получает URL последних N вакансий"""
    result = await db.execute(
        select(Vacancy.url)
        .order_by(desc(Vacancy.published_date))
        .limit(limit)
    )
    return result.scalars().all()
