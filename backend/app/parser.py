from datetime import datetime

from app.models import ParsedVacancy
import asyncio
import httpx
from bs4 import BeautifulSoup

from app.logger_config import logger


LEVEL_MAPPING = {"intern": 1, "junior": 3, "middle": 4, "senior": 5, "lead": 6}
LEVEL_MAPPING_IN_CART = ('Средний (Middle)', 'Младший (Junior)', 'Стажёр (Intern)', 'Старший (Senior)', 'Ведущий (Lead)')
BASE_URL = "https://career.habr.com"
DELAY_BETWEEN_VACANCIES = 0.5  # секунд
DELAY_BETWEEN_PAGES = 1.0  # секунд
MAX_RETRIES = 3

async def parse_vacancy_card(card, level, vacancy_details):
    link, requierments, description = vacancy_details

    v_title = card.find("a", {"class": "vacancy-card__title-link"})
    title = v_title.get_text(strip=True) if v_title else "Не указано"

    v_company = card.find("a", {"class": "link-comp"})
    company = v_company.get_text(strip=True) if v_company else "Не указана"

    v_salary = card.find("div", {"class": "basic-salary"})
    salary = v_salary.get_text(strip=True) if v_salary else "ЗП не указана"

    date_element = card.find("time", {"class": "basic-date"})
    if date_element and date_element.get('datetime'):
        try:
            published_date = datetime.fromisoformat(date_element['datetime'])
        except ValueError:
            published_date = None
    else:
        published_date = None

    card_level = [R for R in LEVEL_MAPPING_IN_CART if R in requierments]
    if card_level:
        level = card_level[0]
        requierments.remove(level)
    elif level == 'all':
        level = 'Квалификация не указана'

    return ParsedVacancy(
        level=level,
        title=title,
        company=company,
        url=link,
        salary=salary,
        skills=requierments,
        published_date=published_date,
        description=description
    )


async def parse_vacancy_detail_from_card(card, client):
    """Получить URL из карточки и спарсить description"""
    v_link = card.find("a", {"class": "vacancy-card__backdrop-link"})
    if not v_link:
        return "Описание недоступно"
    v_url = BASE_URL + v_link["href"]
    requierments, description = await parse_vacancy_detail(v_url, client, MAX_RETRIES)
    return v_url, requierments, description


async def fetch_vacancies(url, level, page=1):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }

    async with httpx.AsyncClient(headers=headers) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"Ошибка при запросе страницы {page}: {e}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        cards = soup.find_all("div", {"class": "vacancy-card"})
        if not cards:
            return []

        vacancies = []

        for i, card in enumerate(cards, 1):
            vacancy_details = await parse_vacancy_detail_from_card(card, client)
            vacancy = await parse_vacancy_card(card, level, vacancy_details)
            logger.info(f"Парсинг вакансии {i}/{len(cards)}: {vacancy.title}")
            vacancies.append(vacancy)
            await asyncio.sleep(DELAY_BETWEEN_VACANCIES)

        return vacancies


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
            await asyncio.sleep(DELAY_BETWEEN_PAGES)

    soup = BeautifulSoup(response.text, "html.parser")
    description_block = soup.find(
        "div", {"class": "vacancy-description__text"}
    )
    requierments_block = soup.find('h2', class_='content-section__title', string=lambda t: "Требования" in t)

    if requierments_block:
        v_requierments = _requierments_parse(requierments_block.parent.parent)
    else:
        v_requierments = "Требованию отсутствуют"

    if description_block:
        v_description = _parse_description(description_block)
    else:
        v_description = "Описание отсутствует"

    return v_requierments, v_description

def _requierments_parse(block):
    inline_list = block.find('span', class_='inline-list')

    # Находим все span внутри, которые содержат текст требований
    requirements = []
    for span in inline_list.find_all('span', recursive=False):
        text_span = span.find('span')
        if text_span:
            text = text_span.get_text(strip=True)
            if ',' in text:
                text_lst = text.split(',')
                requirements += text_lst
            else:
                requirements.append(text)

    return requirements


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


async def parse_habr_vacancies(level="Junior", max_pages=2, search_query='python+backend'):
    if level == "all":
        query_url = f"{BASE_URL}/vacancies?q={search_query}&sort=date&type=all"
    else:
        query_url = f"{BASE_URL}/vacancies?q={search_query}&sort=date&qid={LEVEL_MAPPING.get(level, 3)}"
    
    logger.info(f"Запуск парсинга: уровень={level}, страниц={max_pages}\n url для парсинга: {query_url}")

    all_vacancies = []
    for page in range(1, max_pages + 1):
        logger.info(f"Парсинг страницы {page}...")
        url = f"{query_url}&page={page}"

        vacancies_list = await fetch_vacancies(url, level, page)
        all_vacancies.extend(vacancies_list)

        if page < max_pages:
            await asyncio.sleep(1)

    logger.info(f"Парсинг завершен. Найдено вакансий: {len(all_vacancies)}")
    return all_vacancies
