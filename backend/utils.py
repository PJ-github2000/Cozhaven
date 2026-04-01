import json
import re
from datetime import datetime, timezone
from typing import Any, Optional
from sqlalchemy.orm import Session


def parse_specs(specs_str: Optional[str]):
    """Parse specs from JSON or 'key:value|key:value' format to dict."""
    if not specs_str:
        return None

    try:
        data = json.loads(specs_str)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    result = {}
    for pair in specs_str.split("|"):
        parts = pair.split(":", 1)
        if len(parts) == 2:
            result[parts[0].strip()] = parts[1].strip()
    return result if result else None


def slugify(value: str) -> str:
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value or "product"


def generate_slug(name: str, used_slugs: set[str]) -> str:
    base = slugify(name)
    slug = base
    counter = 2
    while slug in used_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def generate_default_sku(product_id: int, used_skus: set[str]) -> str:
    base = f"CH-{product_id:05d}"
    sku = base
    counter = 2
    while sku in used_skus:
        sku = f"{base}-{counter}"
        counter += 1
    return sku


def _default_variant(product: Any):
    variants = getattr(product, "variants", None) or []
    if variants:
        return sorted(variants, key=lambda variant: (variant.position or 9999, variant.id or 0))[0]
    return None


def _sorted_variants(product: Any):
    variants = getattr(product, "variants", None) or []
    return sorted(variants, key=lambda variant: (variant.position or 9999, variant.id or 0))


def _sorted_options(product: Any):
    options = getattr(product, "options", None) or []
    return sorted(options, key=lambda option: (option.position or 9999, option.id or 0))


def _normalized_datetime(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def active_scheduled_price(entity: Any, now: Optional[datetime] = None):
    schedules = getattr(entity, "scheduled_prices", None) or []
    moment = _normalized_datetime(now or datetime.now(timezone.utc))
    eligible = []
    for schedule in schedules:
        if not getattr(schedule, "is_active", 1):
            continue
        starts_at = _normalized_datetime(getattr(schedule, "starts_at", None))
        ends_at = _normalized_datetime(getattr(schedule, "ends_at", None))
        if starts_at and starts_at > moment:
            continue
        if ends_at and ends_at < moment:
            continue
        eligible.append(schedule)
    if not eligible:
        return None
    eligible.sort(key=lambda schedule: (_normalized_datetime(getattr(schedule, "starts_at", None)) or datetime.min.replace(tzinfo=timezone.utc), getattr(schedule, "id", 0)), reverse=True)
    return eligible[0]


def variant_effective_pricing(variant: Any, product: Any = None, now: Optional[datetime] = None, db: Optional[Session] = None, user: Optional[Any] = None):
    from pricing import get_active_price
    
    # If we have DB and optionally a user, use the full resolving engine
    if db:
        resolved = get_active_price(db, variant, user)
        return {
            "price": float(resolved["price"]),
            "compare_at_price": float(resolved["compare_at_price"]) if resolved["compare_at_price"] is not None else None,
            "source": resolved["source"],
            "label": resolved["label"],
            "schedule_id": None # Placeholder for V1 compliance
        }

    # Fallback to current simple logic if no DB session provided (e.g. background tasks or simple to_dict)
    variant_schedule = active_scheduled_price(variant, now)
    fallback_product_schedule = active_scheduled_price(product, now) if product is not None else None
    schedule = variant_schedule or fallback_product_schedule
    
    if schedule is not None:
        return {
            "price": float(schedule.price),
            "compare_at_price": float(schedule.compare_at_price) if getattr(schedule, "compare_at_price", None) is not None else None,
            "source": "variant_schedule" if variant_schedule else "product_schedule",
            "schedule_id": getattr(schedule, "id", None),
        }
    return {
        "price": float(variant.price) if getattr(variant, "price", None) is not None else None,
        "compare_at_price": float(variant.compare_at_price) if getattr(variant, "compare_at_price", None) is not None else None,
        "source": "base",
        "schedule_id": None,
    }


def product_effective_pricing(product: Any, now: Optional[datetime] = None, db: Optional[Session] = None, user: Optional[Any] = None):
    default_variant = _default_variant(product)
    if default_variant is not None:
        resolved = variant_effective_pricing(default_variant, product, now, db, user)
        return {
            "price": resolved["price"],
            "compare_at_price": resolved["compare_at_price"],
            "source": resolved["source"],
            "schedule_id": resolved.get("schedule_id"),
            "base_price": float(default_variant.price) if default_variant.price is not None else float(product.price or 0),
            "base_compare_at_price": float(default_variant.compare_at_price) if default_variant.compare_at_price is not None else float(product.original_price) if product.original_price is not None else None,
        }

    # If no variants, fallback to product level schedules
    schedule = active_scheduled_price(product, now)
    if schedule is not None:
        return {
            "price": float(schedule.price),
            "compare_at_price": float(schedule.compare_at_price) if getattr(schedule, "compare_at_price", None) is not None else None,
            "source": "product_schedule",
            "schedule_id": getattr(schedule, "id", None),
            "base_price": float(product.price or 0),
            "base_compare_at_price": float(product.original_price) if product.original_price is not None else None,
        }

    return {
        "price": float(product.price or 0),
        "compare_at_price": float(product.original_price) if product.original_price is not None else None,
        "source": "base",
        "schedule_id": None,
        "base_price": float(product.price or 0),
        "base_compare_at_price": float(product.original_price) if product.original_price is not None else None,
    }


def product_to_dict(product: Any, db: Optional[Session] = None, user: Optional[Any] = None):
    """Convert a Product ORM object to the frontend-friendly shape."""
    default_variant = _default_variant(product)
    variants = _sorted_variants(product)
    options = _sorted_options(product)
    inventory_item = getattr(default_variant, "inventory_item", None) if default_variant else None
    pricing = product_effective_pricing(product, db=db, user=user)
    price = pricing["price"]
    original_price = pricing["compare_at_price"]
    stock = inventory_item.available_quantity if inventory_item is not None else product.stock

    seo = getattr(product, "seo", None)
    now = datetime.now(timezone.utc)
    product_active_schedule = active_scheduled_price(product, now)
    variant_active_schedule_ids = {
        variant.id: getattr(active_scheduled_price(variant, now), "id", None)
        for variant in variants
    }
    all_scheduled_prices = (getattr(product, "scheduled_prices", None) or []) + [
        scheduled
        for variant in variants
        for scheduled in (getattr(variant, "scheduled_prices", None) or [])
    ]

    return {
        "id": product.id,
        "name": product.name,
        "slug": getattr(product, "slug", None),
        "sku": default_variant.sku if default_variant else generate_default_sku(product.id, set()),
        "productType": getattr(product, "product_type", "simple") or "simple",
        "price": price,
        "originalPrice": original_price,
        "basePrice": pricing["base_price"],
        "baseOriginalPrice": pricing["base_compare_at_price"],
        "effectivePriceSource": pricing["source"],
        "activeScheduleId": pricing["schedule_id"],
        "description": product.description or "",
        "shortDescription": getattr(product, "short_description", None) or "",
        "brand": getattr(product, "brand", None),
        "category": product.category,
        "categoryId": getattr(product, "category_id", None),
        "subcategory": product.subcategory or product.category.replace("-", " ").title(),
        "isFeatured": bool(getattr(product, "is_featured", False)),
        "stock": stock or 0,
        "images": product.images.split(",") if product.images else [],
        "colors": product.colors.split(",") if product.colors else [],
        "sizes": product.sizes.split(",") if product.sizes else [],
        "badge": product.badge,
        "salePercent": product.sale_percent,
        "rating": product.rating or 4.5,
        "reviews": product.reviews or 0,
        "specs": parse_specs(product.specs),
        "materials": product.materials.split(",") if getattr(product, "materials", None) else [],
        "configurations": product.configurations.split(",") if getattr(product, "configurations", None) else [],
        "colorNames": product.colorNames.split(",") if getattr(product, "colorNames", None) else [],
        "isCanadianMade": bool(getattr(product, "is_canadian_made", True)),
        "status": product.status,
        "seo": {
            "metaTitle": seo.meta_title if seo else None,
            "metaDescription": seo.meta_description if seo else None,
            "canonicalUrl": seo.canonical_url if seo else None,
            "robotsDirective": seo.robots_directive if seo else None,
        },
        "scheduledPrices": [
            {
                "id": schedule.id,
                "label": schedule.label,
                "productId": schedule.product_id,
                "variantId": schedule.variant_id,
                "price": float(schedule.price) if schedule.price is not None else None,
                "compareAtPrice": float(schedule.compare_at_price) if schedule.compare_at_price is not None else None,
                "startsAt": schedule.starts_at.isoformat() if schedule.starts_at else None,
                "endsAt": schedule.ends_at.isoformat() if schedule.ends_at else None,
                "isActive": bool(schedule.is_active),
                "activeNow": (
                    schedule.id == variant_active_schedule_ids.get(schedule.variant_id)
                    if schedule.variant_id
                    else schedule.id == getattr(product_active_schedule, "id", None)
                ),
            }
            for schedule in sorted(
                all_scheduled_prices,
                key=lambda scheduled: (scheduled.starts_at or datetime.min.replace(tzinfo=timezone.utc), scheduled.id or 0),
                reverse=True,
            )
        ],
        "options": [
            {
                "id": option.id,
                "name": option.name,
                "position": option.position,
                "values": [
                    {
                        "id": value.id,
                        "value": value.value,
                        "displayValue": value.display_value,
                        "position": value.position,
                    }
                    for value in sorted(option.values, key=lambda item: (item.position or 9999, item.id or 0))
                ],
            }
            for option in options
        ],
        "variants": [
            (lambda effective: {
                "id": variant.id,
                "title": variant.title,
                "sku": variant.sku,
                "slug": variant.slug,
                "price": effective["price"],
                "compareAtPrice": effective["compare_at_price"],
                "basePrice": float(variant.price) if variant.price is not None else None,
                "baseCompareAtPrice": float(variant.compare_at_price) if variant.compare_at_price is not None else None,
                "effectivePriceSource": effective["source"],
                "activeScheduleId": effective["schedule_id"],
                "status": variant.status,
                "position": variant.position,
                "stock": variant.inventory_item.available_quantity if variant.inventory_item else 0,
                "availableQuantity": variant.inventory_item.available_quantity if variant.inventory_item else 0,
                "reservedQuantity": variant.inventory_item.reserved_quantity if variant.inventory_item else 0,
                "reorderThreshold": variant.inventory_item.reorder_threshold if variant.inventory_item else 10,
                "trackInventory": bool(variant.inventory_item.track_inventory) if variant.inventory_item else True,
                "selectedOptions": [
                    {
                        "optionName": link.option_value.option.name if getattr(link, "option_value", None) and getattr(link.option_value, "option", None) else None,
                        "value": link.option_value.value if getattr(link, "option_value", None) else None,
                        "displayValue": link.option_value.display_value if getattr(link, "option_value", None) else None,
                    }
                    for link in sorted(
                        getattr(variant, "option_links", []) or [],
                        key=lambda option_link: (
                            getattr(getattr(getattr(option_link, "option_value", None), "option", None), "position", 9999),
                            getattr(getattr(option_link, "option_value", None), "position", 9999),
                        ),
                    )
                    if getattr(link, "option_value", None)
                ],
            })(variant_effective_pricing(variant, product))
            for variant in variants
        ],
    }


def collection_to_dict(collection: Any, include_products: bool = True):
    result = {
        "id": collection.id,
        "name": collection.name,
        "slug": collection.slug,
        "description": collection.description,
        "image_url": collection.image_url,
        "is_featured": bool(collection.is_featured),
    }
    if include_products and hasattr(collection, "products"):
        result["products"] = [product_to_dict(product) for product in collection.products]
    return result
