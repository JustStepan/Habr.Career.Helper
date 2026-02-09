from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routes import auth, parser, crud, favorite_crud
from app.scheduler import scheduler, configure_scheduler
from app.logger_config import logger

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Запуск приложения...")
    configure_scheduler()
    scheduler.start()
    logger.info("Scheduler запущен")
    
    yield
    
    # Shutdown
    logger.info("Остановка приложения...")
    scheduler.shutdown()
    logger.info("Scheduler остановлен")


app = FastAPI(
    title="Habr Career Parser API",
    description="API для парсинга вакансий с Habr Career",
    version="1.0.0",
    lifespan=lifespan,                      # ← Scheduler
    root_path="/habr-vacancies/api"         # ← Production path
)

# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Маршруты
routers = [auth.router, parser.router, crud.router, favorite_crud.router]
for router in routers:
    app.include_router(router, prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)