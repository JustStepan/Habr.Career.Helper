import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from dotenv import load_dotenv
import os

from datetime import datetime, timedelta
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, selectinload

from app.db_models import Vacancy, Skill
from app.models import VacancyResponse
from tools import llm_get_best_vacancy


# Путь к .env относительно этого файла
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")
# Настройка БД (синхронная для LangGraph)
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

DAYS_LIMIT = 20
INITIAL_LIMIT = 40
LIMIT_DECAY = 0.7  # Коэффициент уменьшения лимита (0.5 = делится пополам)

class VacancyState(TypedDict):
    user_query: str
    skills: List[str]
    level: str
    filtered_vacancies: List[dict] | None
    best_vacancy: dict | None
    final_answer: str


def create_filter_node():
    def filter_db(state: VacancyState) -> dict:
        skills = state.get("skills", [])
        level = state.get("level")

        if not skills:
            return {"filtered_vacancies": []}

        with SessionLocal() as db:
            date_threshold = datetime.now() - timedelta(days=DAYS_LIMIT)

            # Получаем все вакансии с хотя бы одним совпадающим скиллом
            query = (
                select(Vacancy)
                .options(selectinload(Vacancy.skills))
                .where(Vacancy.level == level)
                .where(Vacancy.published_date > date_threshold)
                .where(Vacancy.skills.any(Skill.name.in_(skills)))
                .order_by(Vacancy.published_date.desc())
                .distinct()
            )

            result = db.execute(query)
            all_candidates = result.scalars().all()

            # Считаем количество совпадающих скиллов для каждой вакансии
            skills_set = set(skills)

            def match_count(vacancy):
                vacancy_skills = {s.name for s in vacancy.skills}
                return len(vacancy_skills & skills_set)

            # Группируем вакансии по количеству совпадений
            by_match_count: dict[int, list] = {}
            for v in all_candidates:
                count = match_count(v)
                if count not in by_match_count:
                    by_match_count[count] = []
                by_match_count[count].append(v)

            # Сортируем каждую группу: сначала по republish_count (меньше = лучше), потом по дате
            for count in by_match_count:
                by_match_count[count].sort(
                    key=lambda v: (v.republish_count or 0, -(v.published_date or datetime.min).timestamp())
                )

            # Каскадная выборка: от максимального совпадения к минимальному
            # Лимит уменьшается по коэффициенту LIMIT_DECAY на каждом уровне
            all_vacancies = []
            limit = INITIAL_LIMIT

            for match_level in range(len(skills), 0, -1):
                candidates = by_match_count.get(match_level, [])
                selected = candidates[:limit]
                all_vacancies.extend(selected)

                print(f"🔍 Совпадений {match_level}/{len(skills)}: выбрано {len(selected)} из {len(candidates)} (лимит {limit})")

                limit = max(1, int(limit * LIMIT_DECAY))

            # Сортируем итоговый список: republish_count ASC, затем дата DESC
            all_vacancies.sort(
                key=lambda v: (v.republish_count or 0, -(v.published_date or datetime.min).timestamp())
            )

            # Конвертируем в JSON-совместимые словари
            vacancies = [
                VacancyResponse.model_validate(v).model_dump(mode="json")
                for v in all_vacancies
            ]

            print(f"🔍 Всего вакансий: {len(vacancies)}")
            return {"filtered_vacancies": vacancies}

    return filter_db


def decide_next_step(state: VacancyState) -> str:
    vacancies = state.get("filtered_vacancies") or []

    match len(vacancies):
        case 0:
            return "no_results"
        case 1:
            return "single_result"
        case _:
            return "multiple_results"


def llm_rank(state: VacancyState) -> dict:
    query = state["user_query"]
    skills = state.get("skills", [])
    vacancies = state["filtered_vacancies"]

    best_id = llm_get_best_vacancy(vacancies, query, skills)

    if best_id is None:
        return {"best_vacancy": None}

    # Ищем в списке (не в БД)
    best_vacancy = next((v for v in vacancies if v["id"] == best_id), None)

    print(
        f"🎯 Лучшая вакансия: {best_vacancy['title'] if best_vacancy else 'не найдена'}"
    )
    return {"best_vacancy": best_vacancy}


def take_single(state: VacancyState) -> dict:
    vacancy = state["filtered_vacancies"][0]
    print(f"📌 Единственная вакансия: {vacancy['title']}")
    return {"best_vacancy": vacancy}


def format_answer(state: VacancyState) -> dict:
    vacancy = state.get("best_vacancy")

    if not vacancy:
        answer = "К сожалению, подходящих вакансий не найдено 😔"
    else:
        skills_list = [s["name"] for s in vacancy.get("skills", [])]

        answer = f"""
✅ Нашёл идеальную вакансию!

**{vacancy['title']}**
Компания: {vacancy.get('company', 'N/A')}
Уровень: {vacancy.get('level', 'N/A')}
Навыки: {', '.join(skills_list)}

Описание:
{vacancy.get('description', 'Нет описания')[:500]}...
"""

    return {"final_answer": answer}


# Строим граф
graph = StateGraph(VacancyState)

graph.add_node("filter", create_filter_node())
graph.add_node("llm_rank", llm_rank)
graph.add_node("take_single", take_single)
graph.add_node("format", format_answer)

graph.set_entry_point("filter")

graph.add_conditional_edges(
    "filter",
    decide_next_step,
    {
        "no_results": "format",
        "single_result": "take_single",
        "multiple_results": "llm_rank",
    },
)

graph.add_edge("llm_rank", "format")
graph.add_edge("take_single", "format")
graph.add_edge("format", END)

app = graph.compile()


if __name__ == "__main__":
    result = app.invoke(
        {
            "user_query": "Я бекенд-разработчик. Мне нужен полный рабочий день, стабильная компания, работа в офисе и дружный коллектив.",
            "skills": ["PostgreSQL", "FastAPI", "Docker", "Python"],
            "level": "Middle",
        }
    )

    print("\n" + "=" * 50)
    print(result["final_answer"])
