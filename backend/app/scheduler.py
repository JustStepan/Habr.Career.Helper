from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone

from app.tasks import scheduled_parsing_task
from app.logger_config import logger

# Создаем экземпляр планировщика
scheduler = AsyncIOScheduler()

# Часовой пояс
moscow_tz = timezone('Europe/Moscow')


def configure_scheduler():
    """Настраивает задачи планировщика"""
    
    scheduler.add_job(
        func=scheduled_parsing_task,
        trigger=CronTrigger(
            hour='8,10,12,14,16,18,20,4',
            minute=0,
            timezone=moscow_tz
        ),
        id='parse_vacancies',
        replace_existing=True
    )
    
    logger.info("Scheduler настроен: парсинг в 8:00-20:00 (каждые 2ч) + 4:00 (МСК)")


async def run_parsing_now():
    """Запустить парсинг немедленно (для тестирования)"""
    logger.info("Запуск парсинга вручную")
    await scheduled_parsing_task()