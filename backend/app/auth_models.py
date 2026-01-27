from pydantic import BaseModel, EmailStr, Field

# Регистрация (что клиент отправляет)
class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)

# Логин (что клиент отправляет)
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Ответ при логине (что сервер возвращает)
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Данные текущего пользователя (для GET /auth/me)
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    
    class Config:
        from_attributes = True