from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date

from app.db_models import ParseStatus


class SkillResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True


class VacancySearchFilter(BaseModel):
    level: str
    published_date: datetime

    @field_validator('published_date', mode='before')
    @classmethod
    def parse_custom_date(cls, value):
        if isinstance(value, str):
            from datetime import datetime
            return datetime.strptime(value, "%d.%m.%Y").date()
        return value


class ParsedVacancy(BaseModel):
    """Данные из парсера (до сохранения в БД)"""
    level: str
    title: str
    company: str
    url: str
    salary: str
    description: str
    published_date: Optional[datetime]
    skills: List[str]  # ← Скилы внутри модели

class VacancyResponse(BaseModel):
    id: int
    level: str
    title: str
    company: str
    url: str
    salary: str
    description: str
    published_date: Optional[datetime] = None
    publish_count: int
    skills: List[SkillResponse]  # ← Список скиллов
    
    class Config:
        from_attributes = True


class ParseRequest(BaseModel):
    """Запрос на парсинг"""
    level: str = Field(default="Junior", description="Уровень ('Intern/Junior/Middle/Senior/Lead' или все перечисленное)")
    search_query: str = Field(default='python+backend', description="Запрос на поиск вакансий", alias="searchQuery") # поля на фронте и бэке несоответствуют (имена) поэтому добавлен alias
    max_pages: int = Field(default=2, ge=1, le=10, description="Количество зугружаемых страниц (1-10)", alias="maxPages")


class VacanciesDBRequest(BaseModel):
    level: str
    skills: Optional[str] = None
    date_limit: Optional[date] = None


class ParsingStatusResponse(BaseModel):
    status: ParseStatus
    last_updated: Optional[datetime] = None
    vacancies_added: int = 0
    total_vacancies: int = 0
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True