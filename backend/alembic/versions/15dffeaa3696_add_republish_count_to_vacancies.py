"""Add republish_count to vacancies

Revision ID: 15dffeaa3696
Revises: 3a9cd210fbcc
Create Date: 2026-02-01 21:25:31.398632

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '15dffeaa3696'
down_revision: Union[str, Sequence[str], None] = '3a9cd210fbcc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('vacancies', 
        sa.Column('republish_count', sa.Integer(), nullable=False, server_default='0')
    )

def downgrade():
    op.drop_column('vacancies', 'republish_count')