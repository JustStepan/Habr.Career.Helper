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
