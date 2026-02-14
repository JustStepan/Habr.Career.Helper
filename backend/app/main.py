"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.routes import auth, parser, crud, favorite_crud, statistics
from app.scheduler import scheduler, configure_scheduler
from app.logger_config import logger

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Запуск приложения {settings.APP_NAME} v{settings.APP_VERSION}")
    configure_scheduler()
    scheduler.start()
    logger.info("Scheduler запущен")
    
    yield
    
    logger.info("Остановка приложения...")
    scheduler.shutdown()
    logger.info("Scheduler остановлен")


app = FastAPI(
    title=settings.APP_NAME,
    description="API для парсинга вакансий с Habr Career",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    root_path="/habr-vacancies/api"
)

# Rate Limiting
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Превышен лимит запросов. Попробуйте позже."}
    )

# CORS - настраивается через CORS_ORIGINS в .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS_LIST,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Маршруты
routers = [auth.router, parser.router, crud.router, favorite_crud.router, statistics.router]
for router in routers:
    app.include_router(router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
