#!/bin/bash
set -e

echo "🔄 Применение миграций..."
uv run alembic upgrade head

echo "🚀 Запуск FastAPI с 4 воркерами..."
exec uv run uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 4 \
  --log-level info
