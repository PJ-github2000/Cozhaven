"""
Cozhaven database setup.
Engine, session factory, schema bootstrap, and small compatibility migrations.
"""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL
from models import Base, Product, Variant, InventoryItem, ProductSEO
from utils import generate_slug, generate_default_sku


connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _table_columns(inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def _ensure_product_columns() -> None:
    inspector = inspect(engine)
    if "products" not in inspector.get_table_names():
        return

    columns = _table_columns(inspector, "products")
    statements = []

    if "slug" not in columns:
        statements.append("ALTER TABLE products ADD COLUMN slug VARCHAR")
    if "product_type" not in columns:
        statements.append("ALTER TABLE products ADD COLUMN product_type VARCHAR DEFAULT 'simple'")
    if "updated_at" not in columns:
        if engine.dialect.name == "sqlite":
            statements.append("ALTER TABLE products ADD COLUMN updated_at DATETIME")
        else:
            statements.append("ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()")

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
        if "slug" not in columns:
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_products_slug ON products (slug)"))
        if "updated_at" not in columns:
            if engine.dialect.name == "sqlite":
                connection.execute(text("UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL"))
            else:
                connection.execute(text("UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL"))


def _backfill_catalog_foundation() -> None:
    session = SessionLocal()
    try:
        products = session.query(Product).all()
        used_slugs = {slug for (slug,) in session.query(Product.slug).filter(Product.slug.isnot(None)).all()}
        used_skus = {sku for (sku,) in session.query(Variant.sku).all()}

        for product in products:
            if not product.slug:
                product.slug = generate_slug(product.name, used_slugs)
                used_slugs.add(product.slug)
            if not product.product_type:
                product.product_type = "simple"

            default_variant = (
                session.query(Variant)
                .filter(Variant.product_id == product.id)
                .order_by(Variant.position.asc(), Variant.id.asc())
                .first()
            )
            if default_variant is None:
                sku = generate_default_sku(product.id, used_skus)
                used_skus.add(sku)
                default_variant = Variant(
                    product_id=product.id,
                    title=product.name,
                    sku=sku,
                    slug=product.slug,
                    price=product.price,
                    compare_at_price=product.original_price,
                    status=product.status or "active",
                    position=1,
                )
                session.add(default_variant)
                session.flush()

                session.add(
                    InventoryItem(
                        variant_id=default_variant.id,
                        available_quantity=product.stock or 0,
                        reorder_threshold=10,
                        track_inventory=1,
                    )
                )

            if product.seo is None:
                session.add(
                    ProductSEO(
                        product_id=product.id,
                        meta_title=product.name,
                        meta_description=(product.description or "")[:160] or None,
                    )
                )

        session.commit()
    finally:
        session.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_product_columns()
    _backfill_catalog_foundation()
    print("Database tables initialized and catalog foundation ensured.")
