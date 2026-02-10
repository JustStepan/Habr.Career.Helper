import pytest
from pathlib import Path

from bs4 import BeautifulSoup


def test_html_fixture_exists():
    '''Проверяем что HTML файлы на месте'''
    fixtures_dir = Path(__file__).parent / "fixtures"

    list_file = fixtures_dir / "vacancies_list.html"
    detail_file = fixtures_dir / "vacancy_detail.html"

    assert list_file.exists(), "Файл vacancies_list.html не найден"
    assert detail_file.exists(), "Файл vacancy_detail.html не найден"


def test_():
    '''Тестируем функцию получения уровня(level) и скилов(Skills)
    level: str
    skills: List[str]
    '''
    pass