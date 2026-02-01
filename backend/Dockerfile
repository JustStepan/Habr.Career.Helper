FROM python:3.12-slim

WORKDIR /app

# Копируем uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Копируем файлы зависимостей
COPY pyproject.toml uv.lock ./

# Устанавливаем зависимости (без dev)
RUN uv sync --frozen --no-dev

# Копируем код приложения
COPY ./app ./app
COPY alembic.ini .
COPY ./alembic ./alembic

# Открываем порт
EXPOSE 8000

# Запускаем через uv
# --workers 4 — количество процессов (для production)
# --log-level info — логирование
CMD ["uv", "run", "uvicorn", "app.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4", \
     "--log-level", "info"]