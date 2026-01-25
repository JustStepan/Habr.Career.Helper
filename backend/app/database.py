from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv

# Загружаем переменные из .env
load_dotenv()

# Строка подключения
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
# SQLite (файловая БД, без сервера)
# DATABASE_URL = "sqlite+aiosqlite:///./test.db" # здесь "//" - путь(нет сервера) и далее "/./" - начало относительного пути к файлам БД

# Движок (менеджер подключений)
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # логирование SQL запросов True (для отладки)/ False - отключить
)

# Фабрика сессий
SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Базовый класс для моделей
Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session