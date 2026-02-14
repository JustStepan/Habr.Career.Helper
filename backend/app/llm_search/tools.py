"""
LLM tools for vacancy ranking and selection.
"""

import os
import json
from typing import List, Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Async OpenAI client for non-blocking calls
client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

DEFAULT_MODEL = "xiaomi/mimo-v2-flash"


async def llm_rank_vacancies(
    vacancies: List[dict],
    query: str,
    skills: List[str],
    top_n: int = 2,
    model: str = DEFAULT_MODEL,
) -> List[int]:
    """
    Ранжирует вакансии с помощью LLM и возвращает топ-N ID.

    Args:
        vacancies: Список вакансий в формате dict
        query: Запрос пользователя
        skills: Скиллы пользователя
        top_n: Сколько лучших вакансий вернуть
        model: Модель LLM

    Returns:
        Список ID вакансий в порядке релевантности
    """
    if not vacancies:
        return []

    # Ограничиваем контекст для LLM
    truncated_vacancies = _truncate_vacancies(vacancies, max_skills=5)

    prompt = _build_ranking_prompt(truncated_vacancies, query, skills, top_n)

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,  # Низкая температура для стабильности
            max_tokens=500,
        )

        content = response.choices[0].message.content
        if content is None:
            return []

        result = json.loads(content)
        ranked_ids = result.get("ranked_ids", [])

        # Фильтруем только существующие ID
        valid_ids = [
            vid for vid in ranked_ids if any(v["id"] == vid for v in vacancies)
        ]

        return valid_ids[:top_n]

    except Exception as e:
        # Логируем ошибку, но не падаем - fallback на первые N
        return [v["id"] for v in vacancies[:top_n]]


def _truncate_vacancies(
    vacancies: List[dict], max_skills: int = 5
) -> List[dict]:
    """Урезает описания и скиллы для экономии токенов."""
    truncated = []
    for v in vacancies:
        truncated.append(
            {
                "id": v["id"],
                "title": v["title"],
                "company": v["company"],
                "level": v["level"],
                "salary": v.get("salary", ""),
                "description": v.get("description", "")[
                    :500
                ],  # Ограничиваем описание
                "skills": v.get("skills", [])[
                    :max_skills
                ],  # Только топ скиллы
                "republish_count": v.get("republish_count", 0),
            }
        )
    return truncated


def _build_ranking_prompt(
    vacancies: List[dict], query: str, skills: List[str], top_n: int
) -> str:
    """Строит промпт для LLM ранжирования."""
    return f"""Ты — эксперт по подбору IT-вакансий. Проанализируй запрос пользователя и ранжируй вакансии.

ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
"{query}"

СКИЛЛЫ ПОЛЬЗОВАТЕЛЯ:
{', '.join(skills)}

ВАКАНСИИ (в формате JSON):
{json.dumps(vacancies, ensure_ascii=False, indent=2)}

ЗАДАЧА:
Выбери {top_n} наиболее подходящих вакансии и верни их ID в порядке релевантности (от лучшей к менее подходящей).

КРИТЕРИИ ОЦЕНКИ (в порядке важности):
1. Соответствие запросу (формат работы, локация, тип компании)
2. Наличие требуемых скиллов
3. Уровень (Middle для Middle и т.д.)
4. Меньший republish_count (свежие вакансии лучше)
5. Интересность описания и условий

ВЕРНИ ТОЛЬКО JSON:
{{"ranked_ids": [id1, id2, ...]}}
"""
