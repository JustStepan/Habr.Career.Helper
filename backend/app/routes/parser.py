from typing import List

from fastapi import HTTPException, Depends, APIRouter
import httpx

from app.database import get_db
from app.crud import create_vacancy_with_skills
from app.models import ParseRequest, VacancyResponse
from app.parser import parse_habr_vacancies
from app.logger_config import logger

from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(tags=["parser"])


@router.post("/parse", response_model=List[VacancyResponse])
async def parse_vacancies(
    request: ParseRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        vacancies = await parse_habr_vacancies(request.level, request.max_pages, request.search_query)
        logger.info(f'Успешно обработано {len(vacancies)} вакансий.')
        
    except httpx.HTTPError as e:  # ← Конкретная ошибка сети
        logger.error(f"Ошибка сети при парсинге: {e}")
        raise HTTPException(status_code=503, detail="Сервис habr.com недоступен")
        
    except Exception as e:  # ← Остальные ошибки
        logger.exception(f"Неожиданная ошибка: {e}")  # ← .exception() логирует traceback
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")

    if not vacancies:
        logger.warning("Вакансии не найдены!")
        raise HTTPException(status_code=404, detail="Вакансии не найдены")

    saved_vacancies = []
    for vac in vacancies:  # vac это ParsedVacancy Pydantic модель
        vac_dict = vac.model_dump(exclude={'skills'})  # ← Без мутации!
        skills_list = vac.skills
        vacancy = await create_vacancy_with_skills(db, vac_dict, skills_list)
        if vacancy:  # пропускаем дубликаты (None)
            saved_vacancies.append(vacancy)
        else:
            logger.info(f"Дубликат пропущен: {vac.title}")

    logger.info(f"Всего дублей: {len(vacancies) - len(saved_vacancies)}")
    return saved_vacancies
