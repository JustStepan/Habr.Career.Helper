from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, text, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Промежуточная таблица (многие-ко-многим)
vacancy_skills = Table(
    'vacancy_skills',
    Base.metadata,
    Column('vacancy_id', Integer, ForeignKey('vacancies.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
)

favorite_vacancy_skills = Table(
    'favorite_vacancy_skills',
    Base.metadata,
    Column('favorite_vacancy_id', Integer, ForeignKey('favorite_vacancies.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Связь One-to-Many с избранными вакансиями
    favorite_vacancies = relationship(
        "FavoriteVacancy",
        back_populates="owner",
        cascade="all, delete-orphan"  # Удалить избранные при удалении юзера
    )

class Vacancy(Base):
    __tablename__ = "vacancies"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(50), nullable=False)
    title = Column(String(100), nullable=False)
    company = Column(String(200), nullable=False)
    url = Column(String(1000), nullable=False, unique=True)
    salary = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    published_date = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=True)
    
    # Связь многие-ко-многим
    skills = relationship(
        "Skill",
        secondary=vacancy_skills,
        back_populates="vacancies"
    )


class FavoriteVacancy(Base):
    __tablename__ = "favorite_vacancies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Связь с пользователем
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # КОПИЯ полей из оригинальной вакансии
    level = Column(String(50), nullable=False)
    title = Column(String(100), nullable=False)
    company = Column(String(200), nullable=False)
    url = Column(String(1000), nullable=False)
    salary = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    published_date = Column(DateTime(timezone=True), nullable=True)
    
    # Дополнительные поля (личные данные пользователя)
    user_notes = Column(Text, default="")  # Заметки
    added_at = Column(DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    
    # Связь с пользователем
    owner = relationship("User", back_populates="favorite_vacancies")
    
    # Связь с навыками (Many-to-Many)
    skills = relationship(
        "Skill",
        secondary="favorite_vacancy_skills",  # Новая промежуточная таблица!
        back_populates="favorite_vacancies"
    )


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # уникальные скиллы
    
    # Обратная связь
    vacancies = relationship(
        "Vacancy",
        secondary=vacancy_skills,
        back_populates="skills"
    )

    # НОВАЯ связь с избранными вакансиями
    favorite_vacancies = relationship(
        "FavoriteVacancy",
        secondary=favorite_vacancy_skills,
        back_populates="skills"
    )