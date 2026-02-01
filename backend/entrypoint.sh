#!/bin/bash
set -e

# Только первый воркер (определяется переменной окружения) делает миграции
if [ "${WORKER_ID:-0}" = "0" ]; then
    echo "🔄 Worker 0: Применение миграций..."
    uv run alembic upgrade head
else
    echo "⏳ Worker ${WORKER_ID}: Ожидание миграций..."
    sleep 5  # Даем время первому воркеру
fi

echo "🚀 Запуск FastAPI worker ${WORKER_ID}..."
exec uv run uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 4 \
  --log-level info
