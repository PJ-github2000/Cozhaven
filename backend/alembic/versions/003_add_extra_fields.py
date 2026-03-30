"""Add collections and extra product fields

Revision ID: 003_add_extra_fields
Revises: 002_production_updates
Create Date: 2026-03-18 20:50:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_add_extra_fields'
down_revision = '002_production_updates'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Get inspector to check existing schema
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # 1. Create collections table if it doesn't exist
    if 'collections' not in tables:
        op.create_table(
            'collections',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('slug', sa.String(), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('image_url', sa.String(), nullable=True),
            sa.Column('is_featured', sa.Integer(), nullable=True, server_default='0'),
            sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_collections_id'), 'collections', ['id'], unique=False)
        op.create_index(op.f('ix_collections_slug'), 'collections', ['slug'], unique=True)

    # 2. Add extra fields to products if they don't exist
    product_columns = [col['name'] for col in inspector.get_columns('products')]
    
    if 'materials' not in product_columns:
        op.add_column('products', sa.Column('materials', sa.Text(), nullable=True))
    if 'configurations' not in product_columns:
        op.add_column('products', sa.Column('configurations', sa.Text(), nullable=True))
    if 'colorNames' not in product_columns:
        op.add_column('products', sa.Column('colorNames', sa.Text(), nullable=True))
    if 'is_canadian_made' not in product_columns:
        op.add_column('products', sa.Column('is_canadian_made', sa.Integer(), nullable=True, server_default='1'))
    if 'collection_id' not in product_columns:
        op.add_column('products', sa.Column('collection_id', sa.Integer(), nullable=True))
        # Add foreign key constraint only if we added the column
        op.create_foreign_key('fk_products_collections', 'products', 'collections', ['collection_id'], ['id'])

def downgrade() -> None:
    op.drop_constraint('fk_products_collections', 'products', type_='foreignkey')
    op.drop_column('products', 'collection_id')
    op.drop_column('products', 'is_canadian_made')
    op.drop_column('products', 'colorNames')
    op.drop_column('products', 'configurations')
    op.drop_column('products', 'materials')
    op.drop_index(op.f('ix_collections_slug'), table_name='collections')
    op.drop_index(op.f('ix_collections_id'), table_name='collections')
    op.drop_table('collections')
