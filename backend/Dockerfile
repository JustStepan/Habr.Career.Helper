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


COPY entrypoint.sh .
RUN chmod +x entrypoint.sh  # ← Делаем исполняемым

EXPOSE 8000

# Используем entrypoint вместо CMD
ENTRYPOINT ["./entrypoint.sh"]
