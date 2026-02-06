from datetime import datetime, timezone
from typing import Any, Dict, List

import asyncio
import httpx

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.logger_config import logger
from app.database import SessionLocal
from app.parser import parse_habr_vacancies
from app.crud import create_vacancy_with_skills, create_parsing_job, get_latest_vacancy_urls
from app.db_models import ParseStatus, Vacancy
from app.models import ParsedVacancy


async def scheduled_parsing_task():
    """Фоновая задача парсинга по расписанию"""
    
    async with SessionLocal() as db:
        # 1. Создаем запись о начале парсинга
        job = await create_parsing_job(db)
        
        try:
            # 2. Получаем последние URL для проверки дубликатов
            known_urls = await get_latest_vacancy_urls(db, limit=25)  # limit=25 Сколько берем последних url для проверки (одна страница)

            # 3. Парсим с retry логикой
            vacancies = await parse_with_retry(known_urls)

            # 4. Сохраняем в БД
            saved_count = 0
            if len(vacancies) > 0:
                logger.info(f'Начинаем процесс сохрания вакансий в БД.\nВсего вакансий: {len(vacancies)}')
                saved_count = await save_vacancies(db, vacancies)
            
            # 5. Обновляем статус
            job.status = ParseStatus.SUCCESS
            job.completed_at = datetime.now(timezone.utc)
            job.added_vacancies = saved_count # по умолчанию 0 в БД
            await db.commit()
            logger.info(f"Новых вакансий в БД = {saved_count}")
            
        except Exception as e:
            # 6. Ошибка - записываем в job
            job.status = ParseStatus.ERROR
            job.completed_at = datetime.now(timezone.utc)
            job.error_message = str(e)
            await db.commit()
            logger.error(f"Ошибка парсинга: {e}")


async def parse_with_retry(known_urls: List[str]) -> List[ParsedVacancy]:
    """Парсинг с retry логикой"""
    max_retries = 3
    retry_delay = 20 * 60  # 20 минут
    
    for attempt in range(max_retries):
        try:
            return await parse_habr_vacancies(
                level="all",
                max_pages=20,
                search_query="",
                known_urls=known_urls  # ← Передаем для остановки при дубликате
            )
        except httpx.HTTPError as e:
            if attempt < max_retries - 1:
                logger.warning(f"Попытка {attempt + 1} неудачна, retry через 20 минут")
                await asyncio.sleep(retry_delay)
            else:
                raise  # Последняя попытка - пробрасываем ошибку


async def save_vacancies(db: AsyncSession, vacancies: List[ParsedVacancy]) -> int:
    """Сохраняет вакансии в БД, возвращает количество новых"""
    saved_count = 0
    
    for i, vac in enumerate(vacancies, 1):
        try:
            vac_dict = vac.model_dump(exclude={'skills'})
            skills_list = vac.skills
            
            vacancy = await create_vacancy_with_skills(db, vac_dict, skills_list)
            
            if vacancy:
                saved_count += 1
                logger.info(f"Вакансия {i} сохранена: {vac.title}")
            else:
                logger.info(f"Вакансия {i} - дубликат: {vac.title}")
                
        except Exception as e:
            logger.error(f"❌ Ошибка при сохранении вакансии {i}: {e}")
            logger.exception(e)  # Полный traceback
    
    logger.info(f"Сохранение завершено. Сохранено {saved_count} из {len(vacancies)}")
    return saved_count


async def check_page_status(url: str) -> Dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                return {"status": "not found", "code": 404}
            return {"status": "ok", "code": response.status_code}
    except Exception as e:
        return {"status": "error", "message": str(e), "code": 500}


async def check_vacancies_availability(db_session_factory):
    """Проверка вакансий на доступность. Если недоступно (404) флаг в модели is_active = False
        ВАЖНО === Нужно потом будет установить лимит запросов, чтобы не дергать все вакансии
    """
    async with db_session_factory() as db:
        # Берем только активные вакансии
        result = await db.execute(select(Vacancy).where(Vacancy.is_active == True))
        vacancies = result.scalars().all()
        
        logger.info(f"Начинем проверку {len(vacancies)} вакансий на 404...")

        for i in range(0, len(vacancies), 10):  # Проверяем пачками по 10 штук
            chunk = vacancies[i:i + 10]
            tasks = [check_page_status(v.url) for v in chunk]
            
            # Выполняем 10 запросов параллельно
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for v, res in zip(chunk, results):
                if isinstance(res, dict) and res.get('code') == 404:
                    v.is_active = False
                    logger.info(f"Вакансия {v.id} (404) помечена как неактивная")
            
            await db.commit()  # Сохраняем результат после каждой пачки
            await asyncio.sleep(1)  # Небольшая пауза, чтобы не спамить сайт