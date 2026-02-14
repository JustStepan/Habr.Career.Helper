"""
Конфигурация приложения.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 день
    
    # LLM
    OPENROUTER_API_KEY: str
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"
    
    @property
    def CORS_ORIGINS_LIST(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    # Parser
    PARSER_DELAY_VACANCY: float = 0.5
    PARSER_DELAY_PAGE: float = 1.0
    PARSER_MAX_RETRIES: int = 3
    
    # Search
    SEARCH_DAYS_LIMIT: int = 20
    SEARCH_INITIAL_LIMIT: int = 40
    SEARCH_LIMIT_DECAY: float = 0.7
    
    # App
    APP_NAME: str = "Habr Career Parser"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
