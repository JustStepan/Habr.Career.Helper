from sqlalchemy import Column, Integer, String, DateTime, Text, text, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Промежуточная таблица (многие-ко-многим)
vacancy_skills = Table(
    'vacancy_skills',
    Base.metadata,
    Column('vacancy_id', Integer, ForeignKey('vacancies.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
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