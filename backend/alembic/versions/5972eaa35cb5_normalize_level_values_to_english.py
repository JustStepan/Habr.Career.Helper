"""normalize_level_values_to_english

Revision ID: 5972eaa35cb5
Revises: cf8e8137bf12
Create Date: 2026-01-27 20:48:03.446574

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5972eaa35cb5'
down_revision: Union[str, Sequence[str], None] = 'cf8e8137bf12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Маппинг старых значений на новые
LEVEL_MAPPING = {
    'Стажёр (Intern)': 'Intern',
    'Младший (Junior)': 'Junior',
    'Средний (Middle)': 'Middle',
    'Старший (Senior)': 'Senior',
    'Ведущий (Lead)': 'Lead',
    'Квалификация не указана': 'Не указана',
}

# Обратный маппинг для downgrade
LEVEL_MAPPING_REVERSE = {v: k for k, v in LEVEL_MAPPING.items()}


def upgrade() -> None:
    """Обновляет значения level на английские варианты."""
    for old_value, new_value in LEVEL_MAPPING.items():
        op.execute(
            sa.text(
                "UPDATE vacancies SET level = :new_value WHERE level = :old_value"
            ).bindparams(new_value=new_value, old_value=old_value)
        )
        op.execute(
            sa.text(
                "UPDATE favorite_vacancies SET level = :new_value WHERE level = :old_value"
            ).bindparams(new_value=new_value, old_value=old_value)
        )


def downgrade() -> None:
    """Откатывает значения level обратно на русские варианты."""
    for new_value, old_value in LEVEL_MAPPING_REVERSE.items():
        op.execute(
            sa.text(
                "UPDATE vacancies SET level = :old_value WHERE level = :new_value"
            ).bindparams(old_value=old_value, new_value=new_value)
        )
        op.execute(
            sa.text(
                "UPDATE favorite_vacancies SET level = :old_value WHERE level = :new_value"
            ).bindparams(old_value=old_value, new_value=new_value)
        )
