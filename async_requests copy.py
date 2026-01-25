from datetime import datetime
import json

import asyncio
import httpx
from bs4 import BeautifulSoup

from backend.logger_config import logger


REQUIREQ_LEVEL = "Middle"
MAX_PAGES = 2
LEVEL_MAPPING = {"Intern": 1, "Junior": 3, "Middle": 4, "Senior": 5, "lead": 6}
BASE_URL = "https://career.habr.com"
QUERY_URL = f"https://career.habr.com/vacancies?q=python%20backend&qid={LEVEL_MAPPING.get(REQUIREQ_LEVEL, 1)}"


async def parse_vacancy_card(card):

    v_title = card.find("a", {"class": "vacancy-card__title-link"})
    title = v_title.get_text(strip=True) if v_title else "Не указано"

    v_company = card.find("a", {"class": "link-comp"})
    company = v_company.get_text(strip=True) if v_company else "Не указано"

    v_link = card.find("a", {"class": "vacancy-card__backdrop-link"})
    link = (
        BASE_URL + v_link["href"]
        if v_link
        else "Ссылка на вакансию отсутствует"
    )

    v_sallary = card.find("div", {"class": "basic-salary"})
    sallary = v_sallary.get_text(strip=True) if v_sallary else "ЗП не указана"

    v_date = card.find("time", {"class": "basic-date"})
    if v_date:
        date = datetime.fromisoformat(v_date["datetime"])
        date_str = f"{date:%d.%m.%Y}"
    else:
        date_str = "Дата не указана"

    v_skills = card.find("div", {"class": "vacancy-card__skills"})
    if v_skills:
        skills = [
            sk.get_text(strip=True)
            for sk in v_skills.find_all(
                "a", {"class": "link-comp link-comp--appearance-dark"}
            )
        ]
    else:
        skills = "Блок требований к знаниям соискателя отсутствет"

    return {
        "Требование уровня знаний": REQUIREQ_LEVEL,
        "Название вакансии": title,
        "Название компании": company,
        "Ссылка на вакансию": link,
        "Требуемые навыки": skills,
        "Заработная плата": sallary,
        "Время размещения вакансии": date_str,
    }


async def fetch_vacancies(url, page=1):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }

    async with httpx.AsyncClient(headers=headers) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"Ошибка при запросе страницы {page}: {e}")
            return {f"page_{page}": []}

        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.find_all("div", {"class": "vacancy-card"})
        if not cards:
            return {f"page_{page}": []}

        vacancies = []

        for i, card in enumerate(cards, 1):
            vacancy = await parse_vacancy_card(card)
            logger.info(
                f"Парсинг вакансии {i}/{len(cards)}: {vacancy['Название вакансии']}"
            )

            vacancy_description = await parse_vacancy_detail(
                vacancy["Ссылка на вакансию"], client, 3
            )
            vacancy["Описание вакансии"] = vacancy_description
            vacancies.append(vacancy)

            await asyncio.sleep(0.5)

        return {f"page_{page}": vacancies}


async def parse_vacancy_detail(url, client, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = await client.get(url)

            if response.status_code == 429:
                # Rate limit — подождать и повторить
                wait_time = 2**attempt  # Экспоненциальная задержка
                logger.warning(f"Rate limit для {url}, ожидание {wait_time}s")
                await asyncio.sleep(wait_time)
                continue

            response.raise_for_status()
            break

        except httpx.HTTPError as e:
            logger.error(f"Ошибка при загрузке {url}: {e}")
            if attempt == max_retries - 1:
                return "Описание недоступно"
            await asyncio.sleep(1)

    soup = BeautifulSoup(response.text, "html.parser")
    description_block = soup.find(
        "div", {"class": "vacancy-description__text"}
    )

    if description_block:
        return _parse_description(description_block)
    else:
        return "Описание отсутствует"


def _parse_description(block):
    # Ищем внутренний блок style-ugc
    style_ugc = block.find("div", {"class": "style-ugc"})

    if not style_ugc:
        # Если нет style-ugc, работаем с самим блоком
        style_ugc = block

    result_text = []

    for child in style_ugc.find_all(recursive=False):
        if child.name == "h3":
            # Заголовок с отступом
            result_text.append(f"\n{child.get_text(strip=True)}\n")

        elif child.name in ["ul", "ol"]:
            # Списки
            for li in child.find_all("li"):
                result_text.append(f"  • {li.get_text(strip=True)}")

        elif child.name == "p":
            # Параграфы
            text = child.get_text(strip=True)
            if text:
                result_text.append(text)

    return "\n".join(result_text)


async def fetch_all_pages(max_pages=2):
    all_vacancies = []
    for page in range(1, max_pages + 1):
        logger.info(f"Парсинг страницы {page}...")
        url = f"{QUERY_URL}&page={page}"
        vacancies = await fetch_vacancies(url, page)
        all_vacancies.append(vacancies)

        if page < max_pages:  # Не ждать после последней страницы
            await asyncio.sleep(1)

    return all_vacancies


if __name__ == "__main__":

    @logger.catch
    async def main():
        logger.info("===Приложение запущено===")
        if MAX_PAGES is None:
            vacancies = await fetch_vacancies(QUERY_URL)
            save_json(vacancies)
        else:
            vacancies = await fetch_all_pages(MAX_PAGES)
            save_json(vacancies)

    def save_json(vacancies):
        with open("vacancies.json", "w", encoding="utf-8") as f:
            json.dump(vacancies, f, ensure_ascii=False, indent=2)
        logger.info("Результаты сохранены в vacancies.json")

    asyncio.run(main())
