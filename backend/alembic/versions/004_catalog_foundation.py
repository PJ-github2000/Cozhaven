"""Add catalog foundation tables and product slug fields

Revision ID: 004_catalog_foundation
Revises: 003_add_extra_fields
Create Date: 2026-03-30 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "004_catalog_foundation"
down_revision = "003_add_extra_fields"
branch_labels = None
depends_on = None


def _table_names(bind):
    return sa.inspect(bind).get_table_names()


def _column_names(bind, table_name):
    return {column["name"] for column in sa.inspect(bind).get_columns(table_name)}


def _index_names(bind, table_name):
    return {index["name"] for index in sa.inspect(bind).get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    tables = _table_names(bind)

    if "products" in tables:
        product_columns = _column_names(bind, "products")
        product_indexes = _index_names(bind, "products")
        with op.batch_alter_table("products") as batch_op:
            if "slug" not in product_columns:
                batch_op.add_column(sa.Column("slug", sa.String(), nullable=True))
            if "product_type" not in product_columns:
                batch_op.add_column(sa.Column("product_type", sa.String(), nullable=True, server_default="simple"))
            if "updated_at" not in product_columns:
                batch_op.add_column(sa.Column("updated_at", sa.DateTime(), nullable=True))
        if "ix_products_slug" not in product_indexes:
            op.create_index("ix_products_slug", "products", ["slug"], unique=True)

    if "product_options" not in tables:
        op.create_table(
            "product_options",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("position", sa.Integer(), nullable=True, server_default="0"),
        )

    if "product_option_values" not in tables:
        op.create_table(
            "product_option_values",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("option_id", sa.Integer(), sa.ForeignKey("product_options.id"), nullable=False),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("display_value", sa.String(), nullable=True),
            sa.Column("position", sa.Integer(), nullable=True, server_default="0"),
        )

    if "variants" not in tables:
        op.create_table(
            "variants",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("sku", sa.String(), nullable=False),
            sa.Column("barcode", sa.String(), nullable=True),
            sa.Column("slug", sa.String(), nullable=True),
            sa.Column("price", sa.Numeric(10, 2), nullable=False),
            sa.Column("compare_at_price", sa.Numeric(10, 2), nullable=True),
            sa.Column("cost", sa.Numeric(10, 2), nullable=True),
            sa.Column("status", sa.String(), nullable=True, server_default="active"),
            sa.Column("weight", sa.Float(), nullable=True),
            sa.Column("position", sa.Integer(), nullable=True, server_default="1"),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("product_id", "position", name="uq_variants_product_position"),
        )
        op.create_index("ix_variants_sku", "variants", ["sku"], unique=True)

    if "variant_option_values" not in tables:
        op.create_table(
            "variant_option_values",
            sa.Column("variant_id", sa.Integer(), sa.ForeignKey("variants.id"), primary_key=True),
            sa.Column("option_value_id", sa.Integer(), sa.ForeignKey("product_option_values.id"), primary_key=True),
        )

    if "inventory_items" not in tables:
        op.create_table(
            "inventory_items",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("variant_id", sa.Integer(), sa.ForeignKey("variants.id"), nullable=False, unique=True),
            sa.Column("available_quantity", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("reserved_quantity", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("reorder_threshold", sa.Integer(), nullable=True, server_default="10"),
            sa.Column("track_inventory", sa.Integer(), nullable=True, server_default="1"),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )

    if "inventory_adjustments" not in tables:
        op.create_table(
            "inventory_adjustments",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("inventory_item_id", sa.Integer(), sa.ForeignKey("inventory_items.id"), nullable=False),
            sa.Column("delta", sa.Integer(), nullable=False),
            sa.Column("reason", sa.String(), nullable=False),
            sa.Column("reference_type", sa.String(), nullable=True),
            sa.Column("reference_id", sa.String(), nullable=True),
            sa.Column("performed_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )

    if "media_assets" not in tables:
        op.create_table(
            "media_assets",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("owner_type", sa.String(), nullable=False),
            sa.Column("owner_id", sa.Integer(), nullable=False),
            sa.Column("variant_id", sa.Integer(), sa.ForeignKey("variants.id"), nullable=True),
            sa.Column("type", sa.String(), nullable=False),
            sa.Column("url", sa.String(), nullable=False),
            sa.Column("alt_text", sa.String(), nullable=True),
            sa.Column("position", sa.Integer(), nullable=True, server_default="0"),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )

    if "product_seo" not in tables:
        op.create_table(
            "product_seo",
            sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), primary_key=True),
            sa.Column("meta_title", sa.String(), nullable=True),
            sa.Column("meta_description", sa.Text(), nullable=True),
            sa.Column("canonical_url", sa.String(), nullable=True),
            sa.Column("robots_directive", sa.String(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )


def downgrade() -> None:
    op.drop_table("product_seo")
    op.drop_table("media_assets")
    op.drop_table("inventory_adjustments")
    op.drop_table("inventory_items")
    op.drop_table("variant_option_values")
    op.drop_index("ix_variants_sku", table_name="variants")
    op.drop_table("variants")
    op.drop_table("product_option_values")
    op.drop_table("product_options")
    op.drop_index("ix_products_slug", table_name="products")
    with op.batch_alter_table("products") as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("product_type")
        batch_op.drop_column("slug")
