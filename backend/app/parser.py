"""
ВАЖНОЕ УТОЧНЕНИЕ. НА ДЕТАЛЬНОЙ СТРАНИЦЕ ПРИСУТСТВЕТ ДЕТАЛЬНОЕ ОПИСАНИЕ ВАКАНСИИ В <script type="application/ld+json">
СЕЙЧАС НЕДОСУГ ПЕРЕПИСЫВАТЬ, НО ЭТО МОЖНО РЕАЛИЗОВАТЬ ПОЗЖЕ
КАК ВИДИТСЯ ЭТО БОЛЕЕ СТАБИЛЬАЯ СХЕМА ПАРСИНГА. В DATA ЕСТЬ ДОПОЛНИТЕЛЬНЫЕ ПОЛЯ КОТОРЫЕ МОЖНО УЧЕСТЬ ДЛЯ СТАТИСТИКИ
"""

from datetime import datetime
from typing import List, Tuple

from app.models import ParsedVacancy
import asyncio
import httpx
from bs4 import BeautifulSoup

from app.logger_config import logger


# =============================================================================
# КОНФИГУРАЦИЯ
# =============================================================================

BASE_URL = "https://career.habr.com"

# Задержки для избежания rate limit
DELAY_BETWEEN_VACANCIES = 0.5  # секунд между запросами вакансий
DELAY_BETWEEN_PAGES = 1.0      # секунд между страницами
MAX_RETRIES = 3                # попыток при ошибке

# Маппинг уровня для URL-параметра qid (используется в URL запросе к сайту)
LEVEL_MAPPING = {
    "intern": 1,
    "junior": 3,
    "middle": 4,
    "senior": 5,
    "lead": 6
}

# Значения level, которые нужно извлечь из skills (фильтруются)
LEVEL_NAMES = {
    'Intern', 'Junior', 'Middle', 'Senior', 'Lead',
}

# Специализации - не являются skills, фильтруются
# МОЖНО ПРЕПИСАТЬ С ИСПОЛЬЗОВАНИЕМ <script type="application/ld+json"> ТОГДА НЕОБХОДИМОСТЬ ЭТОЙ ПРОВЕРКИ ОТПАДЕТ
SPECIALIZATIONS = {
    'Системный администратор', 'Разработчик', 'Тестировщик', 'Аналитик',
    'DevOps', 'Data Scientist', 'Data Engineer', 'Backend', 'Frontend',
    'Fullstack', 'Mobile', 'iOS', 'Android', 'QA', 'ML Engineer',
    'Дизайнер', 'Product Manager', 'Project Manager', 'HR', 'Маркетолог',
    'Бэкенд разработчик', 'Фронтенд разработчик', 'Системный аналитик',
    'Управление проектами', 'DevOps-инженер', 'Ведение переговоров'
}


async def parse_habr_vacancies(
    level: str = "all",
    max_pages: int = 2,
    search_query: str = '',
    known_urls: List[str] = []
) -> List[ParsedVacancy]:
    """
    Основная функция парсинга вакансий с Хабр Карьеры.
    """
    level_lower = level.lower()

    if level_lower == "all":
        query_url = f"{BASE_URL}/vacancies?q={search_query}&sort=date&type=all"
    else:
        qid = LEVEL_MAPPING.get(level_lower, 3)
        query_url = f"{BASE_URL}/vacancies?q={search_query}&sort=date&qid={qid}"

    logger.info(f"Запуск парсинга: уровень={level}, страниц={max_pages}")
    logger.info(f"URL: {query_url}")

    all_vacancies = []
    stop_parsing = False

    for page in range(1, max_pages + 1):
        logger.info(f"Парсинг страницы {page}/{max_pages}...")
        url = f"{query_url}&page={page}"

        vacancies_list = await _fetch_vacancies_page(url, level, page)
        for vacancy in vacancies_list:
            if stop_parsing:
                break
            
            if vacancy.url in known_urls:
                logger.info(f"Дубликат на странице {page}: {vacancy.title} ({vacancy.url})")
                stop_parsing = True
            else:
                all_vacancies.append(vacancy)
        
        # Лог по завершении страницы
        logger.info(f"Страница {page}: добавлено {len([v for v in vacancies_list if v.url not in known_urls and v in all_vacancies])} вакансий")
        
        # Если нашли дубликат - прекращаем загрузку следующих страниц
        if stop_parsing:
            logger.info(f"Парсинг остановлен на странице {page} - найден дубликат")
            break
        
        if page < max_pages:
            await asyncio.sleep(DELAY_BETWEEN_PAGES)

    logger.info(f"Парсинг завершен. Найдено новых вакансий: {len(all_vacancies)}")
    return all_vacancies


async def _fetch_vacancies_page(url: str, level: str, page: int = 1) -> List[ParsedVacancy]:
    """Загружает одну страницу со списком вакансий и парсит каждую."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            logger.error(f"Ошибка при запросе страницы {page}: {e}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")

        # CSS-селектор: div.vacancy-card
        cards = soup.find_all("div", {"class": "vacancy-card"})
        if not cards:
            logger.warning(f"На странице {page} не найдено карточек вакансий")
            return []

        vacancies = []
        for i, card in enumerate(cards, 1):
            try:
                vacancy = await _parse_single_vacancy(card, client, level)
                logger.info(f"Страница {page}, вакансия {i}/{len(cards)}: {vacancy.title}")
                vacancies.append(vacancy)
            except Exception as e:
                logger.error(f"Ошибка при парсинге вакансии {i}: {e}")

            await asyncio.sleep(DELAY_BETWEEN_VACANCIES)

        return vacancies


async def _parse_single_vacancy(card, client, default_level: str) -> ParsedVacancy:
    """Парсит одну вакансию: данные из карточки + детальная страница."""

    # --- Данные из карточки списка ---

    # Title: a.vacancy-card__title-link
    v_title = card.find("a", {"class": "vacancy-card__title-link"})
    title = v_title.get_text(strip=True) if v_title else "Не указано"

    # Company: первый a.link-comp в карточке
    v_company = card.find("a", {"class": "link-comp"})
    company = v_company.get_text(strip=True) if v_company else "Не указана"

    # Salary: div.basic-salary (может отсутствовать)
    v_salary = card.find("div", {"class": "basic-salary"})
    salary = v_salary.get_text(strip=True) if v_salary else "ЗП не указана"

    # Published date: time.basic-date[datetime]
    date_element = card.find("time", {"class": "basic-date"})
    published_date = None
    if date_element and date_element.get('datetime'):
        try:
            published_date = datetime.fromisoformat(date_element['datetime'])
        except ValueError:
            pass

    # URL вакансии: a.vacancy-card__backdrop-link[href]
    v_link = card.find("a", {"class": "vacancy-card__backdrop-link"})
    if not v_link:
        return ParsedVacancy(
            level=default_level,
            title=title,
            company=company,
            url="",
            salary=salary,
            skills=[],
            published_date=published_date,
            description="Описание недоступно"
        )

    vacancy_url = BASE_URL + v_link["href"]

    # --- Данные с детальной страницы ---
    level, skills, description = await _fetch_vacancy_details(vacancy_url, client)

    # Если level не найден на детальной странице, используем default
    if not level:
        level = default_level
    if level == 'all':
        level = 'Не указана'

    return ParsedVacancy(
        level=level,
        title=title,
        company=company,
        url=vacancy_url,
        salary=salary,
        skills=skills,
        published_date=published_date,
        description=description
    )


async def _fetch_vacancy_details(url: str, client) -> Tuple[str, List[str], str]:
    """
    Загружает детальную страницу вакансии и парсит requirements + description.

    Returns:
        (level, skills, description)
    """
    for attempt in range(MAX_RETRIES):
        try:
            response = await client.get(url)

            if response.status_code == 429:
                wait_time = 2 ** attempt
                logger.warning(f"Rate limit для {url}, ожидание {wait_time}s")
                await asyncio.sleep(wait_time)
                continue

            response.raise_for_status()
            break
        except httpx.HTTPError as e:
            logger.error(f"Ошибка при загрузке {url}: {e}")
            if attempt == MAX_RETRIES - 1:
                return "", [], "Описание недоступно"
            await asyncio.sleep(DELAY_BETWEEN_PAGES)
    else:
        return "", [], "Описание недоступно"

    soup = BeautifulSoup(response.text, "html.parser")

    level, skills = _parse_requirements(soup)
    description = _parse_description(soup)

    return level, skills, description


# =============================================================================
# ПАРСИНГ ОТДЕЛЬНЫХ БЛОКОВ
# =============================================================================

def _parse_requirements(soup) -> Tuple[str, List[str]]:
    """
    Парсит блок "Требования" с детальной страницы вакансии.
    Returns:
        (level, skills) - level как 'Junior'/'Middle'/etc, skills как список строк
    """
    level = ""
    skills = []

    # Ищем заголовок "Требования"
    req_header = soup.find(
        'h2',
        class_='content-section__title',
        string=lambda t: t and 'Требования' in t
    )

    if not req_header:
        return level, skills

    # Поднимаемся к родительскому контейнеру
    block = req_header.parent.parent

    # ===== НОВАЯ СТРУКТУРА (2026+) =====
    # div.vacancy-meta содержит chip-элементы
    vacancy_meta = block.find('div', class_='vacancy-meta')
    if vacancy_meta:
        chips = vacancy_meta.find_all(
            'div',
            class_=['chip-with-icon__text', 'chip-without-icon__text']
        )
        for chip in chips:
            text = chip.get_text(strip=True)
            if not text:
                continue
            # Level - один из LEVEL_NAMES
            if text in LEVEL_NAMES:
                if not level:
                    level = text
            # Специализации - пропускаем
            elif text in SPECIALIZATIONS:
                continue
            # Всё остальное - skills
            else:
                skills.append(text)

        return level, skills

    # ===== СТАРАЯ СТРУКТУРА (fallback) =====
    # span.inline-list или div.inline-list
    inline_list = (
        block.find('span', class_='inline-list') or
        block.find('div', class_='inline-list')
    )
    if inline_list:
        for span in inline_list.find_all('span', recursive=False):
            text_span = span.find('span')
            if text_span:
                text = text_span.get_text(strip=True)
                if text in LEVEL_NAMES:
                    if not level:
                        level = text
                elif text not in SPECIALIZATIONS:
                    if ',' in text:
                        skills.extend([s.strip() for s in text.split(',')])
                    else:
                        skills.append(text)

    return level, skills


def _parse_description(soup) -> str:
    """
    Парсит описание вакансии.

    Структура:
        div.vacancy-description__text
            -> div.style-ugc
                -> h3 (заголовки секций)
                -> p (параграфы)
                -> ul/ol -> li (списки)
    """
    description_block = soup.find("div", {"class": "vacancy-description__text"})

    if not description_block:
        return "Описание отсутствует"

    # Внутренний контейнер с контентом
    content = description_block.find("div", {"class": "style-ugc"})
    if not content:
        content = description_block

    result_text = []

    for child in content.find_all(recursive=False):
        if child.name == "h3":
            result_text.append(f"\n{child.get_text(strip=True)}\n")
        elif child.name in ["ul", "ol"]:
            for li in child.find_all("li"):
                result_text.append(f"  * {li.get_text(strip=True)}")
        elif child.name == "p":
            text = child.get_text(strip=True)
            if text:
                result_text.append(text)

    return "\n".join(result_text) if result_text else "Описание отсутствует"
