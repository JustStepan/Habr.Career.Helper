#!/bin/bash
set -e

echo "🔄 Применение миграций..."
uv run alembic upgrade head

echo "🚀 Запуск FastAPI с 1 воркером..."
exec uv run uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 1 \
  --log-level info
