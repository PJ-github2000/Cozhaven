"""Production updates

Revision ID: 002_production_updates
Revises: 001_initial
Create Date: 2026-03-18 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_production_updates'
down_revision = '001_initial'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Handle orders table
    op.add_column('orders', sa.Column('guest_email', sa.String(), nullable=True))
    op.add_column('orders', sa.Column('guest_name', sa.String(), nullable=True))
    op.alter_column('orders', 'user_id', existing_type=sa.Integer(), nullable=True)
    
    # Change Float to Numeric(10, 2)
    # Using raw SQL for safety in SQLite/Postgres compatibility, but SQLAlchemy supports it
    op.alter_column('orders', 'total_amount', type_=sa.Numeric(precision=10, scale=2))
    op.alter_column('orders', 'subtotal', type_=sa.Numeric(precision=10, scale=2))
    op.alter_column('orders', 'tax_amount', type_=sa.Numeric(precision=10, scale=2))
    op.alter_column('orders', 'shipping_cost', type_=sa.Numeric(precision=10, scale=2))
    op.alter_column('orders', 'discount_amount', type_=sa.Numeric(precision=10, scale=2))
    
    op.alter_column('products', 'price', type_=sa.Numeric(precision=10, scale=2))
    op.alter_column('products', 'original_price', type_=sa.Numeric(precision=10, scale=2))
    
    op.alter_column('order_items', 'price', type_=sa.Numeric(precision=10, scale=2))
    
    op.alter_column('promo_codes', 'value', type_=sa.Numeric(precision=10, scale=2))

def downgrade() -> None:
    op.drop_column('orders', 'guest_name')
    op.drop_column('orders', 'guest_email')
    
    op.alter_column('orders', 'total_amount', type_=sa.Float())
    op.alter_column('orders', 'subtotal', type_=sa.Float())
    op.alter_column('orders', 'tax_amount', type_=sa.Float())
    op.alter_column('orders', 'shipping_cost', type_=sa.Float())
    op.alter_column('orders', 'discount_amount', type_=sa.Float())
    
    op.alter_column('products', 'price', type_=sa.Float())
    op.alter_column('products', 'original_price', type_=sa.Float())
    
    op.alter_column('order_items', 'price', type_=sa.Float())
    
    op.alter_column('promo_codes', 'value', type_=sa.Float())
