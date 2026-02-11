from datetime import datetime
import pytest
from pathlib import Path
from unittest.mock import AsyncMock

from bs4 import BeautifulSoup, Tag

from app.parser import SPECIALIZATIONS, _parse_requirements, _parse_description, _parse_single_vacancy, parse_habr_vacancies
from app.models import ParsedVacancy


FIXTURES_DIR = Path(__file__).parent / "fixtures"
LIST_FILE = FIXTURES_DIR / "vacancies_list.html"
DETAIL_FILE = FIXTURES_DIR / "vacancy_detail.html"


def get_soup_file(filepath: Path) -> BeautifulSoup:
    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()
        return BeautifulSoup(html_content, "html.parser")


def test_html_fixture_exists():
    '''Проверяем что HTML файлы на месте'''

    assert LIST_FILE.exists(), "Файл vacancies_list.html не найден"
    assert DETAIL_FILE.exists(), "Файл vacancy_detail.html не найден"


def test_html_vacancy_requirements():
    '''Тестируем функцию получения уровня(level) и скилов(Skills)
    level: str
    skills: List[str]
    '''

    soup = get_soup_file(DETAIL_FILE)
    level, vacancy_skills = _parse_requirements(soup)
    assert not any(s in vacancy_skills for s in SPECIALIZATIONS), \
    f"В скилах не должно быть специализаций! Найдены: {[s for s in SPECIALIZATIONS if s in vacancy_skills]}"
    assert level != "", "level не может быть пустым"
    assert isinstance(vacancy_skills, list), "skills должен быть списком"
    assert len(vacancy_skills) > 0, "В списке должны быть элементы"


def test_html_vacancy_description():
    '''Тестируем функцию получения описания карточки вакансий
    vacancy_description: str
    '''
    soup = get_soup_file(DETAIL_FILE)
    vacancy_description = _parse_description(soup)
    assert isinstance(vacancy_description, str), "vacancy_description должен быть строкой"
    assert len(vacancy_description) > 50, "vacancy_description не может быть меньше 50 символов"
    assert vacancy_description != "Описание отсутствует", "vacancy_description должен отличаться от дефолтного 'Описание отсутствует'"


def test_html_card():
    '''Парсим карточки и проверяем их содержимое
    cards: List[Tag]'''
    soup = get_soup_file(LIST_FILE)
    cards = soup.find_all("div", {"class": "vacancy-card"})

    assert 0 < len(cards) <= 25, "Количество карточек должно быть между 0 и 25"
    assert isinstance(cards[0], Tag), "объект должен быть bs4"
    assert isinstance(cards, list), "cards должен быть списком"


@pytest.mark.asyncio  # Обязательно добавить, что бы pytest понимал - это асинхронная Ф
async def test_parse_single_vacancy(mocker):
    # 1. Подменяем функцию
    mock_fetch = mocker.patch(
        'app.parser._fetch_vacancy_details',
        new_callable=AsyncMock,
        return_value=("Middle", ["Python", "FastAPI", "Docker"], "Тестовое описание вакансии")
    )
    
    # 2. Готовим данные
    soup = get_soup_file(LIST_FILE)
    card = soup.find("div", {"class": "vacancy-card"})
    # 3. Вызываем
    result = await _parse_single_vacancy(card, None, "Junior")
    
    # 4. Проверяем
    assert result.level == "Middle", "level вакансии должен быть получен из функции _fetch_vacancy_details"
    assert "Python" in result.skills, "Возвращаться должен скилл, присутствующий в карточке"
    assert result.description == "Тестовое описание вакансии", "Описание вакансии должно быть получено из функции _fetch_vacancy_details"
    assert isinstance(result.published_date, datetime), "published_date должно быть datetime типом"
    assert result.title is not None, "Заголовок не может быть пустым"
    assert result.company is not None, "Компания не может быть пустой"
    assert result.url.startswith("https://career.habr.com"), "Домен не совпадает с career.habr"
    assert result.salary is not None, "Зарплата не может быть пустой"


def _create_test_vacancy(**kwargs):
    """Создаёт тестовую вакансию с дефолтными значениями"""
    defaults = {
        'level': 'Middle',
        'title': 'Тестовая вакансия',
        'company': 'Тестовая компания',
        'url': 'https://career.habr.com/vacancies/999',
        'salary': 'ЗП не указана',
        'description': 'Описание',
        'published_date': datetime(2000, 1, 1),
        'skills': ['Python', 'FastAPI']
    }
    defaults.update(kwargs)  # Переопределяем нужные поля
    return ParsedVacancy(**defaults)

@pytest.mark.asyncio
async def test_main_parse_func(mocker):
    """Интеграционный тест. Тестирует работу всего парсера"""

    vacancy1 = _create_test_vacancy(
        title='Python-разработчик',
        skills=['Python', 'Perl', 'Docker'],
        salary='от 200 000 до 300 000 ₽'
        )

    vacancy2 = _create_test_vacancy(
        title='Инженер по тестированию',
        url='https://career.habr.com/vacancies/1000164814',
        published_date=datetime(2026, 2, 10, 18, 39, 22),
        )
    
    # Мокируем
    mock_fetch = mocker.patch(
        'app.parser._fetch_vacancies_page',
        new_callable=AsyncMock,
        return_value=[vacancy1, vacancy2]
    )
    
    # Тестируем
    result = await parse_habr_vacancies(
        level="Junior",
        max_pages=1,
        search_query='С++',
        known_urls=['https://career.habr.com/vacancies/1000164814']
    )
    
    assert len(result) == 1, "Вторая вакансия должна была отфильтроваться через проверку known_urls"
    assert isinstance(result[0], ParsedVacancy), "Функция parse_habr_vacancies должна возвразать список ParsedVacancy объектов"
    assert result[0].level == 'Middle', "Вместо дефолтного level должен быть возвращен спарсенный Middle"
    assert 'Perl' in result[0].skills, 'Запись скилов из parse_habr_vacancies происходит некорректно'
    assert isinstance(result[0].published_date, datetime)
