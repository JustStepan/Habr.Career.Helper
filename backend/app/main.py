from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, parser, crud


app = FastAPI(
    title="Habr Career Parser API",
    description="API для парсинга вакансий с Habr Career",
    version="1.0.0",
    root_path="/habr-vacancies/api",  # ← Добавь root_path!
)

# Маршруты
routers = [auth.router, parser.router, crud.router]
for router in routers:
    app.include_router(router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
