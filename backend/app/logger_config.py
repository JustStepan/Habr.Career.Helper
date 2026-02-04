import sys
from loguru import logger

logger.remove()

logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
    level="INFO"
)


logger.add(
    "logs/app.log",
    rotation="10:00",
    retention="30 days",
    compression="zip",
    level="DEBUG"
)
