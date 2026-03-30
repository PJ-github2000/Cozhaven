from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import Product, ProductOption, ProductOptionValue, ScheduledPrice, Variant, VariantOptionValue, User
from redis_cache import get_cache, set_cache
from utils import product_to_dict
from auth import get_current_user_optional
from localization import localize_product


router = APIRouter(prefix="/api/products", tags=["products"])


def _product_query(db: Session):
    return db.query(Product).options(
        joinedload(Product.variants).joinedload(Variant.inventory_item),
        joinedload(Product.variants).joinedload(Variant.option_links).joinedload(VariantOptionValue.option_value).joinedload(ProductOptionValue.option),
        joinedload(Product.variants).joinedload(Variant.scheduled_prices),
        joinedload(Product.options).joinedload(ProductOption.values),
        joinedload(Product.scheduled_prices),
        joinedload(Product.seo),
    )


@router.get("")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    is_featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "featured",
    search: Optional[str] = None,
    min_rating: Optional[float] = None,
    in_stock: Optional[bool] = None,
    badge: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    locale: Optional[str] = None
):
    user_context = f"u{current_user.id}" if current_user else "guest"
    loc_context = locale or "en"
    cache_key = f"products_v5_{user_context}_{loc_context}_{category}_{brand}_{is_featured}_{min_price}_{max_price}_{sort}_{search}_{min_rating}_{in_stock}_{badge}_{page}_{limit}"
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data

    query = _product_query(db).filter(Product.status == "active")

    if category and category != "all":
        query = query.filter(Product.category == category)
    if brand and brand != "all":
        query = query.filter(Product.brand == brand)
    if is_featured is not None:
        query = query.filter(Product.is_featured == (1 if is_featured else 0))
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)
    if in_stock:
        query = query.filter(Product.stock > 0)
    if badge:
        query = query.filter(Product.badge == badge)
    if search:
        search_pattern = f"%{search.strip().lower()}%"
        query = query.filter(
            Product.name.ilike(search_pattern)
            | Product.category.ilike(search_pattern)
            | Product.description.ilike(search_pattern)
            | Product.slug.ilike(search_pattern)
            | Product.brand.ilike(search_pattern)
        )

    if sort == "rating":
        query = query.order_by(Product.rating.desc(), Product.id.asc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc(), Product.id.desc())
    else:
        query = query.order_by(Product.id.asc())

    # Dynamically resolve prices and localized content
    products = [localize_product(db, product_to_dict(p, db=db, user=current_user), locale) for p in query.all()]
    
    if min_price is not None:
        products = [p for p in products if (p.get("price") or 0) >= min_price]
    if max_price is not None:
        products = [p for p in products if (p.get("price") or 0) <= max_price]

    if sort == "price-asc":
        products.sort(key=lambda p: ((p.get("price") or 0), p.get("id") or 0))
    elif sort == "price-desc":
        products.sort(key=lambda p: ((p.get("price") or 0), -(p.get("id") or 0)), reverse=True)

    total = len(products)
    offset = max(page - 1, 0) * limit
    paged_products = products[offset:offset + limit]

    result = {
        "products": paged_products,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }
    await set_cache(cache_key, result, expire=600)
    return result


@router.get("/search")
async def search_products(q: str, limit: int = 10, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional), locale: Optional[str] = None):
    if not q:
        return []

    search_query = f"%{q.strip().lower()}%"
    products = (
        _product_query(db)
        .filter(
            Product.status == "active",
            Product.name.ilike(search_query)
            | Product.category.ilike(search_query)
            | Product.slug.ilike(search_query),
        )
        .limit(limit)
        .all()
    )
    return [localize_product(db, product_to_dict(p, db=db, user=current_user), locale) for p in products]


@router.get("/{identifier}")
async def get_product(identifier: str, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional), locale: Optional[str] = None):
    # Check localized slug first
    from models import ProductTranslation
    translated = db.query(ProductTranslation).filter(
        ProductTranslation.slug == identifier,
        ProductTranslation.locale == locale
    ).first()
    
    resolved_id = identifier
    if translated:
        resolved_id = str(translated.product_id)

    user_context = f"u{current_user.id}" if current_user else "guest"
    loc_context = locale or "en"
    cache_key = f"product_v5_{user_context}_{loc_context}_{resolved_id}"
    cached_product = await get_cache(cache_key)
    if cached_product:
        return cached_product

    query = _product_query(db)
    if resolved_id.isdigit():
        product = query.filter(Product.id == int(resolved_id)).first()
    else:
        product = query.filter(Product.slug == resolved_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    result = localize_product(db, product_to_dict(product, db=db, user=current_user), locale)
    await set_cache(cache_key, result, expire=3600)
    return result
