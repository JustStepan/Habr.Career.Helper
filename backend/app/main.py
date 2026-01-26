from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Path, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.database import get_db
from app.crud import create_vacancy_with_skills, get_vacancy_by_id
from app.models import ParseRequest, VacancyResponse, VacanciesDBRequest
from app.parser import parse_habr_vacancies
from app.logger_config import logger
from app.db_models import Vacancy, Skill
from app.routes import auth

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select, func
from sqlalchemy.orm import selectinload

app = FastAPI(
    title="Habr Career Parser API",
    description="API для парсинга вакансий с Habr Career",
    version="1.0.0",
)
# Маршруты
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/parse", response_model=List[VacancyResponse])
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

@app.get("/api/vacancy/{vac_id}", response_model=VacancyResponse)
async def get_vacancy(
    vac_id: int = Path(..., gt=0, description="ID вакансии"),
    db: AsyncSession = Depends(get_db)
):
    vacancy = await get_vacancy_by_id(db, vac_id)
    if not vacancy:
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return vacancy


@app.post("/api/vacancies", response_model=List[VacancyResponse])
async def get_vacancies(
    request: VacanciesDBRequest,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
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
    return vacancies


@app.get("/api/skills/search", response_model=List[str])
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