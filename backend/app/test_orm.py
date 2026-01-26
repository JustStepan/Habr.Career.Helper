import asyncio
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from database import SessionLocal
from db_models import Skill, Vacancy


async def get_skill(
    db: AsyncSession,
    skill_name: str | None = None,
    skill_id: int | None = None
) -> Skill | None:
    if skill_id:
        query = select(Skill).where(Skill.id == skill_id)
    elif skill_name:
        query = select(Skill).where(Skill.name == skill_name)
    else:
        return None

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_skill(db: AsyncSession, name: str) -> Skill | None:

    skill = await get_skill(db, skill_name=name)
    if skill:
        print(f"Скилл '{name}' уже существует")
        return skill

    new_skill = Skill(name=name)
    db.add(new_skill)
    await db.commit()
    await db.refresh(new_skill)
    print(f"✅ Создан скилл ID={new_skill.id}")
    return new_skill


async def del_skill(db: AsyncSession, skill_name: str | None = None, skill_id: int | None = None) -> bool:

    skill = await get_skill(db, skill_name=skill_name, skill_id=skill_id)

    if not skill:
        print("Скилл не найден")
        return False
    
    await db.delete(skill)
    await db.commit()
    print(f"Скилл '{skill.name}' удален")
    return True


async def update_skill_name(db: AsyncSession, skill_id: int, new_name: str) -> Skill | None:
    skill = await get_skill(db, skill_id=skill_id)
    if not skill:
        print("Скилл не найден")
        return None
    old_name = skill.name
    skill.name = new_name
    print(f'Изменено имя скила № {skill.id} с "{old_name}" на "{new_name}"')
    await db.commit()
    return skill


async def delete_all_vacancies_without_skills(db: AsyncSession) -> int:
    from sqlalchemy.orm import selectinload
    
    # Получить все вакансии со скиллами
    stmt = select(Vacancy).options(selectinload(Vacancy.skills))
    result = await db.execute(stmt)
    all_vacancies = result.scalars().all()
    
    # Удалить вакансии без скиллов
    count = 0
    for vacancy in all_vacancies:
        if len(vacancy.skills) == 0:
            await db.delete(vacancy)
            count += 1
    
    await db.commit()
    print(f"✅ Удалено {count} вакансий без скиллов")
    return count




async def main():
    print("=== Начало тестирования ORM ===\n")
    skill_name = "REST API"

    async with SessionLocal() as db:
        # await create_skill(db, skill_name)  # Создаем скилл 
        # await del_skill(db, skill_id=454)  # Удалить скилл (по id)
        # await del_skill(db, skill_name='Rууу')  # Удалить скилл (по имени)
        # await update_skill_name(db, skill_id=457, new_name="Rууу") # Меняем имя скила
        await delete_all_vacancies_without_skills(db)
    print("\n=== Тестирование завершено ===")


if __name__ == "__main__":
    asyncio.run(main())
