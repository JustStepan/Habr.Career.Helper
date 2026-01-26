from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_db
from app.db_models import User
from app.auth_models import UserRegister, UserLogin, UserResponse, Token
from app.auth_utils import create_access_token, decode_access_token, hash_password, verify_password


security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_user_or_none(db: AsyncSession, email: str = None, username: str = None) -> User | None:
    """Проверяет существование пользователя по email или username"""
    if email:
        result = await db.execute(select(User).where(User.email == email))
    elif username:
        result = await db.execute(select(User).where(User.username == username))
    else:
        return None
    
    return result.scalar_one_or_none()

@router.post('/register', response_model=UserResponse)
async def registration(
    reg_data: UserRegister, 
    db: AsyncSession = Depends(get_db)
):
    if await get_user_or_none(db, email=reg_data.email):
        raise HTTPException(409, "Email уже зарегистрирован")

    if await get_user_or_none(db, username=reg_data.username):
        raise HTTPException(409, "Username уже занят")
    
    # Создание пользователя
    new_user = User(
        email=reg_data.email,
        username=reg_data.username,
        hashed_password=hash_password(reg_data.password)
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_or_none(db, email=login_data.email)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(401, "Неверные учётные данные")

    return {
        "access_token": create_access_token(data={"user_id": user.id}),
        "token_type": "bearer"
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    
    token = credentials.credentials
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(401, "Невалидный токен")
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(401, "Невалидный токен")

    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    
    return user

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user



# Создай функцию get_current_user() (Dependency)
# Она должна:

# Извлекать токен из заголовка Authorization: Bearer <token>
# Декодировать токен через decode_access_token()
# Находить пользователя по user_id из токена
# Возвращать объект User


# Создай endpoint GET /auth/me с зависимостью Depends(get_current_user)


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