"""Phase 1 completion: add categories table, brand/short_description/is_featured/category_id to products

Revision ID: 005_phase1
Revises: 1bbd567e0600
Create Date: 2026-03-30
"""
from alembic import op
import sqlalchemy as sa

revision = "005_phase1"
down_revision = "1bbd567e0600"
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create categories table
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("slug", sa.String, unique=True, index=True, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("image_url", sa.String, nullable=True),
        sa.Column("parent_id", sa.Integer, sa.ForeignKey("categories.id"), nullable=True, index=True),
        sa.Column("position", sa.Integer, server_default="0"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )

    # 2. Add missing columns to products
    with op.batch_alter_table("products") as batch_op:
        batch_op.add_column(sa.Column("brand", sa.String, nullable=True))
        batch_op.add_column(sa.Column("short_description", sa.Text, nullable=True))
        batch_op.add_column(sa.Column("is_featured", sa.Integer, server_default="0"))
        batch_op.add_column(sa.Column("category_id", sa.Integer, nullable=True))
        batch_op.create_index("ix_products_brand", ["brand"])
        batch_op.create_index("ix_products_is_featured", ["is_featured"])
        batch_op.create_index("ix_products_category_id", ["category_id"])
        batch_op.create_foreign_key("fk_products_category_id", "categories", ["category_id"], ["id"])


def downgrade():
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_constraint("fk_products_category_id", type_="foreignkey")
        batch_op.drop_index("ix_products_category_id")
        batch_op.drop_index("ix_products_is_featured")
        batch_op.drop_index("ix_products_brand")
        batch_op.drop_column("category_id")
        batch_op.drop_column("is_featured")
        batch_op.drop_column("short_description")
        batch_op.drop_column("brand")

    op.drop_table("categories")
