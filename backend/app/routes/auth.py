from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Path, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import httpx
from passlib.context import CryptContext

from app.database import get_db
from app.crud import create_vacancy_with_skills, get_vacancy_by_id
from app.auth_models import UserRegister, UserResponse
from app.parser import parse_habr_vacancies
from app.logger_config import logger
from app.auth_utils import hash_password, verify_password
from app.db_models import User, Vacancy, Skill

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post('/register', response_model=UserResponse)
async def registration(reg_data: UserRegister, db: AsyncSession = Depends(get_db)):
    is_email_exist = await db.execute(select(User).where(User.email == reg_data.email))
    is_username_exist = await db.execute(select(User).where(User.username == reg_data.username))

    if is_email_exist.scalar_one_or_none() or is_username_exist.scalar_one_or_none():
        raise HTTPException(409, "Эти учетные данные уже зарегистрированы")

    hashed_password = hash_password(reg_data.password)

    new_user = User(
        email=reg_data.email,
        username=reg_data.username,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    logger.info(f'Пользователь "{new_user.username}" с id: {new_user.id} успешно зарегистрирован')

    return new_user












# from passlib.context import CryptContext
# from jose import jwt
# from dotenv import load_dotenv
# import os

# load_dotenv()

# SECRET_KEY = os.getenv('SECRET_KEY', 'My-super-key')
# print(f"✅ SECRET_KEY загружен: {SECRET_KEY[:20]}...")

# # === ТЕСТ 1: Хеширование паролей ===
# print("\n=== ТЕСТ 1: Хеширование ===")

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # def hash_password(password: str) -> str:
# #     password_bytes = password.encode('utf-8')[:72]
# #     return pwd_context.hash(password_bytes)

# # def verify_password(plain_password: str, hashed_password: str) -> bool:
# #     password_bytes = plain_password.encode('utf-8')[:72]
# #     return pwd_context.verify(password_bytes, hashed_password)

# # Тест короткого пароля
# short_pass = "test123456"
# hashed_short = pwd_context.hash(short_pass)
# print(f"Пароль: {short_pass}")
# print(f"Хеш: {hashed_short}")
# print(f"Проверка: {pwd_context.verify(short_pass, hashed_short)}")  # True
# print(f"Неверный: {pwd_context.verify('wrong', hashed_short)}")      # False

# # Тест длинного пароля
# long_pass = "a" * 100  # 100 символов
# hashed_long = pwd_context.hash(long_pass)
# print(f"\nДлинный пароль ({len(long_pass)} символов)")
# print(f"Хеш: {hashed_long}...")
# print(f"Проверка: {pwd_context.verify(long_pass, hashed_long)}")  # True
# print(f"Неверный: {pwd_context.verify('wrong', hashed_long)}")      # False

# # === ТЕСТ 2: JWT токены ===
# print("\n=== ТЕСТ 2: JWT ===")

# payload = {"user_id": 2, "email": "test@example.com"}
# token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
# print(f"Токен: {token[:50]}...")

# decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
# print(f"Декодированный payload: {decoded}")

# # Тест подделанного токена
# try:
#     fake_payload = {"user_id": 999}
#     fake_token = jwt.encode(fake_payload, "wrong-secret", algorithm="HS256")
#     jwt.decode(fake_token, SECRET_KEY, algorithms=["HS256"])
#     print("❌ ОШИБКА: подделанный токен прошёл проверку!")
# except Exception as e:
#     print(f"✅ Подделанный токен отклонён: {type(e).__name__}")

# print("\n✅ Все тесты пройдены!")