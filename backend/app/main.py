from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, parser, crud
from app.scheduler import scheduler, configure_scheduler
from app.logger_config import logger


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

# Маршруты
routers = [auth.router, parser.router, crud.router]
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