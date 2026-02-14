from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Any, Dict, List, Optional
from datetime import datetime, date

from app.db_models import ParseStatus


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True) # Новый синтаксис
    id: int
    name: str


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
    model_config = ConfigDict(from_attributes=True) # Новый синтаксис

    id: int
    level: str
    title: str
    company: str
    url: str
    salary: str
    description: str
    published_date: Optional[datetime] = None
    republish_count: int
    skills: List[SkillResponse]  # ← Список скиллов

    model_config = ConfigDict(
        from_attributes=True,  # Для SQLAlchemy
        json_encoders={
            datetime: lambda v: v.isoformat() if v else None
        }
    )


class FavoriteVacancyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True) # Новый синтаксис

    id: int
    owner_id: int
    user_notes: str
    original_vacancy_id: int
    level: str
    title: str
    company: str
    url: str
    salary: str
    description: str
    published_date: Optional[datetime] = None
    skills: List[SkillResponse] = []


class SearchVacanciesResponse(BaseModel):
    vacancies: List[VacancyResponse] | List[FavoriteVacancyResponse]
    favorites_map: dict[int, int] | None  # {original_vacancy_id: favorite_vacancy_id}

class ParseRequest(BaseModel):
    """Запрос на парсинг"""
    level: str = Field(default="Junior", description="Уровень ('Intern/Junior/Middle/Senior/Lead' или все перечисленное)")
    search_query: str = Field(default='', description="Запрос на поиск вакансий", alias="searchQuery") # поля на фронте и бэке несоответствуют (имена) поэтому добавлен alias
    max_pages: int = Field(default=2, ge=1, le=10, description="Количество зугружаемых страниц (1-10)", alias="maxPages")


class FavoriteRequest(BaseModel):
    favorite_id: int = Field(description="ID вакансии")


class VacanciesDBRequest(BaseModel):
    level: str
    skills: Optional[str] = None
    date_limit: Optional[date] = None


class ParsingStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True) # Новый синтаксис

    status: ParseStatus
    last_updated: Optional[datetime] = None
    vacancies_added: int = 0
    total_vacancies: int = 0
    error_message: Optional[str] = None



class PatchRequest(BaseModel):
    user_notes: str = Field(..., max_length=5000, description="Заметки пользователя")


# ========== LLM Search Models ==========

class LLMSearchRequest(BaseModel):
    """Запрос на LLM-поиск вакансий."""
    user_query: str = Field(
        ..., 
        min_length=3,
        max_length=1000,
        description="Запрос пользователя (что ищет)"
    )
    skills: List[str] = Field(
        ..., 
        min_length=1,
        max_length=20,
        description="Список скиллов пользователя"
    )
    level: str = Field(
        ..., 
        pattern=r"^(Intern|Junior|Middle|Senior|Lead)$",
        description="Уровень: Intern, Junior, Middle, Senior, Lead"
    )


class LLMVacancyResult(BaseModel):

    """Упрощенная вакансия для ответа LLM search."""
    id: int
    title: str
    company: str
    level: str
    salary: str
    match_score: float = Field(
        ..., 
        ge=0.0, 
        le=1.0,
        description="Скор совпадения (0-1)"
    )
    skills: List[str] = Field(
        default_factory=list,
        max_length=10,
        description="Топ скиллы вакансии"
    )


class LLMSearchResponse(BaseModel):
    """Ответ LLM-поиска с primary и secondary вакансиями."""
    primary: Optional[LLMVacancyResult] = Field(
        None,
        description="Наиболее подходящая вакансия"
    )
    secondary: Optional[LLMVacancyResult] = Field(
        None,
        description="Вторая по подходимости вакансия"
    )
    total_found: int = Field(
        ...,
        ge=0,
        description="Всего найдено кандидатов"
    )
    search_stats: Dict[str, Any] = Field(
        default_factory=dict,
        description="Статистика поиска"
    )
