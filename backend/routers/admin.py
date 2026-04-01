"""
Cozhaven admin routes.
"""
import json
import os
import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy import String, and_, desc, func, text
from sqlalchemy.orm import Session, joinedload

from auth import get_current_user, require_role
from config import UPLOAD_DIR
from database import get_db
from logger import get_logger
from models import (
    AdminApprovalRequest,
    AdminAuditLog,
    BackgroundJob,
    InventoryAdjustment,
    InventoryItem,
    Order,
    Product,
    ProductOption,
    ProductOptionValue,
    ProductSEO,
    PromoCode,
    ScheduledPrice,
    User,
    Variant,
    VariantOptionValue,
)
from redis_cache import clear_cache_pattern, delete_cache
from schemas import (
    AdminApprovalRequestResponse,
    ApprovalDecisionInput,
    AdminAuditLogResponse,
    BulkActionFilters,
    BulkActionRequest,
    BulkPriceUpdate,
    BulkStatusUpdate,
    InventoryAdjustmentRequest,
    InventoryAdjustmentResult,
    InventoryHistoryResponse,
    InventoryWorkbenchItem,
    PaginatedAdminApprovalRequests,
    PromoCodeAdminInput,
    PaginatedBackgroundJobs,
    BackgroundJobResponse,
    PaginatedInventoryWorkbench,
    PaginatedAdminAuditLogs,
    OrderStatusUpdate,
    PaginatedAdminProducts,
    ProductCreate,
    ProductUpdate,
    ScheduledPriceInput,
    UserRoleUpdate,
)
from utils import generate_default_sku, product_effective_pricing, product_to_dict, slugify, variant_effective_pricing


logger = get_logger("admin")
router = APIRouter(prefix="/api/admin", tags=["admin"])
APPROVAL_SLA_HOURS = 24


async def invalidate_product_cache(product_ids: list[int] | None = None):
    if product_ids:
        for product_id in product_ids:
            await delete_cache(f"product_{product_id}")
    await clear_cache_pattern("product_*")
    await clear_cache_pattern("products_v8_*")
    await clear_cache_pattern("products_v9_*")
    await clear_cache_pattern("admin_products_*")


def _admin_product_query(db: Session):
    return db.query(Product).options(
        joinedload(Product.variants).joinedload(Variant.inventory_item),
        joinedload(Product.variants).joinedload(Variant.option_links).joinedload(VariantOptionValue.option_value).joinedload(ProductOptionValue.option),
        joinedload(Product.variants).joinedload(Variant.scheduled_prices),
        joinedload(Product.options).joinedload(ProductOption.values),
        joinedload(Product.scheduled_prices),
        joinedload(Product.seo),
    )


def _default_variant(product: Product) -> Variant | None:
    if not product.variants:
        return None
    return sorted(product.variants, key=lambda variant: (variant.position or 9999, variant.id or 0))[0]


def _ensure_unique_product_slug(db: Session, name: str, desired_slug: str | None = None, product_id: int | None = None) -> str:
    base_slug = slugify(desired_slug or name)
    slug = base_slug
    counter = 2

    while True:
        query = db.query(Product).filter(Product.slug == slug)
        if product_id is not None:
            query = query.filter(Product.id != product_id)
        if query.first() is None:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def _ensure_unique_sku(db: Session, product_id: int, desired_sku: str | None = None, variant_id: int | None = None) -> str:
    base_sku = (desired_sku or generate_default_sku(product_id, set())).strip().upper()
    sku = base_sku
    counter = 2

    while True:
        query = db.query(Variant).filter(Variant.sku == sku)
        if variant_id is not None:
            query = query.filter(Variant.id != variant_id)
        if query.first() is None:
            return sku
        sku = f"{base_sku}-{counter}"
        counter += 1


def _admin_product_list_item(product: Product) -> dict[str, Any]:
    variant = _default_variant(product)
    inventory_item = variant.inventory_item if variant else None
    pricing = product_effective_pricing(product)
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "sku": variant.sku if variant else None,
        "brand": getattr(product, "brand", None),
        "category": product.category,
        "category_id": getattr(product, "category_id", None),
        "is_featured": bool(getattr(product, "is_featured", False)),
        "status": product.status or "active",
        "stock": inventory_item.available_quantity if inventory_item else (product.stock or 0),
        "price": pricing["price"],
        "product_type": product.product_type or "simple",
        "image": product.images.split(",")[0] if product.images else None,
        "created_at": product.created_at,
        "updated_at": getattr(product, "updated_at", None),
    }


def _serialize_specs(specs: dict | str | None) -> str | None:
    if specs is None or specs == "":
        return None
    if isinstance(specs, str):
        return specs
    return json.dumps(specs)


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _serialize_scheduled_price(schedule: ScheduledPrice) -> dict[str, Any]:
    active_now = False
    if schedule.variant is not None:
        active_now = variant_effective_pricing(schedule.variant, schedule.variant.product).get("schedule_id") == schedule.id
    elif schedule.product is not None:
        active_now = product_effective_pricing(schedule.product).get("schedule_id") == schedule.id
    return {
        "id": schedule.id,
        "label": schedule.label,
        "product_id": schedule.product_id,
        "variant_id": schedule.variant_id,
        "price": float(schedule.price) if schedule.price is not None else None,
        "compare_at_price": float(schedule.compare_at_price) if schedule.compare_at_price is not None else None,
        "starts_at": schedule.starts_at.isoformat() if schedule.starts_at else None,
        "ends_at": schedule.ends_at.isoformat() if schedule.ends_at else None,
        "is_active": bool(schedule.is_active),
        "active_now": active_now,
    }


def _serialize_promo_code(promo: PromoCode) -> dict[str, Any]:
    return {
        "id": promo.id,
        "code": promo.code,
        "type": promo.type,
        "value": float(promo.value),
        "description": promo.description,
        "is_active": bool(promo.is_active),
        "expires_at": promo.expires_at.isoformat() if promo.expires_at else None,
        "created_at": promo.created_at.isoformat() if promo.created_at else None,
    }


def _serialize_audit_log(log: AdminAuditLog, user_names: dict[int, str] | None = None) -> dict[str, Any]:
    metadata = None
    if log.metadata_json:
        try:
            metadata = json.loads(log.metadata_json)
        except json.JSONDecodeError:
            metadata = {"raw": log.metadata_json}
    return {
        "id": log.id,
        "entity_type": log.entity_type,
        "entity_id": log.entity_id,
        "entity_label": log.entity_label,
        "action": log.action,
        "summary": log.summary,
        "metadata": metadata,
        "performed_by": log.performed_by,
        "performed_by_name": user_names.get(log.performed_by) if user_names and log.performed_by else None,
        "created_at": log.created_at,
    }


def _serialize_approval_request(
    approval_request: AdminApprovalRequest,
    user_names: dict[int, str] | None = None,
) -> dict[str, Any]:
    payload = None
    if approval_request.payload_json:
        try:
            payload = json.loads(approval_request.payload_json)
        except json.JSONDecodeError:
            payload = {"raw": approval_request.payload_json}
    return {
        "id": approval_request.id,
        "entity_type": approval_request.entity_type,
        "entity_id": approval_request.entity_id,
        "action": approval_request.action,
        "summary": approval_request.summary,
        "status": approval_request.status,
        "is_stale": _approval_is_stale(approval_request),
        "age_hours": round(_approval_age_hours(approval_request), 2),
        "requested_by": approval_request.requested_by,
        "requested_by_name": user_names.get(approval_request.requested_by) if user_names else None,
        "reviewed_by": approval_request.reviewed_by,
        "reviewed_by_name": user_names.get(approval_request.reviewed_by) if user_names and approval_request.reviewed_by else None,
        "review_notes": approval_request.review_notes,
        "payload": payload,
        "created_at": approval_request.created_at,
        "reviewed_at": approval_request.reviewed_at,
    }


def _approval_age_hours(approval_request: AdminApprovalRequest) -> float:
    created_at = approval_request.created_at
    if created_at is None:
        return 0.0
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return max((datetime.now(timezone.utc) - created_at).total_seconds() / 3600.0, 0.0)


def _approval_is_stale(approval_request: AdminApprovalRequest) -> bool:
    return approval_request.status == "pending" and _approval_age_hours(approval_request) >= APPROVAL_SLA_HOURS


def _log_admin_event(
    db: Session,
    action: str,
    entity_type: str,
    summary: str,
    current_user: User | None = None,
    entity_id: int | None = None,
    entity_label: str | None = None,
    metadata: dict[str, Any] | None = None,
):
    db.add(
        AdminAuditLog(
            entity_type=entity_type,
            entity_id=entity_id,
            entity_label=entity_label,
            action=action,
            summary=summary,
            metadata_json=json.dumps(metadata) if metadata else None,
            performed_by=current_user.id if current_user else None,
        )
    )


def _create_approval_request(
    db: Session,
    *,
    entity_type: str,
    entity_id: int | None,
    action: str,
    summary: str,
    payload: dict[str, Any],
    current_user: User,
):
    approval_request = AdminApprovalRequest(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        summary=summary,
        payload_json=json.dumps(payload),
        status="pending",
        requested_by=current_user.id,
    )
    db.add(approval_request)
    db.flush()
    _log_admin_event(
        db,
        action="approval.requested",
        entity_type="approval_request",
        entity_id=approval_request.id,
        entity_label=summary,
        summary=f"Requested approval: {summary}",
        current_user=current_user,
        metadata={
            "approval_request_id": approval_request.id,
            "requested_action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
        },
    )
    return approval_request


def _normalize_option_token(value: str | None) -> str:
    return slugify(value or "")


def _option_value_lookup(product: Product) -> dict[tuple[str, str], ProductOptionValue]:
    lookup: dict[tuple[str, str], ProductOptionValue] = {}
    for option in product.options:
        for value in option.values:
            lookup[(_normalize_option_token(option.name), _normalize_option_token(value.value))] = value
    return lookup


def _sync_product_options(db: Session, product: Product, option_payloads: list[dict[str, Any]] | None):
    if option_payloads is None:
        return _option_value_lookup(product)

    for option in list(product.options):
        db.delete(option)
    db.flush()

    lookup: dict[tuple[str, str], ProductOptionValue] = {}
    for option_index, option_payload in enumerate(option_payloads, start=1):
        option_name = (option_payload.get("name") or "").strip()
        if not option_name:
            continue

        option = ProductOption(
            product_id=product.id,
            name=option_name,
            position=option_payload.get("position") or option_index,
        )
        db.add(option)
        db.flush()

        for value_index, value_payload in enumerate(option_payload.get("values") or [], start=1):
            raw_value = (value_payload.get("value") or "").strip()
            if not raw_value:
                continue
            option_value = ProductOptionValue(
                option_id=option.id,
                value=raw_value,
                display_value=(value_payload.get("display_value") or raw_value).strip(),
                position=value_payload.get("position") or value_index,
            )
            db.add(option_value)
            db.flush()
            lookup[(_normalize_option_token(option_name), _normalize_option_token(raw_value))] = option_value

    return lookup


def _assign_variant_option_links(variant: Variant, selected_options: list[dict[str, Any]] | None, option_lookup: dict[tuple[str, str], ProductOptionValue] | None):
    variant.option_links[:] = []
    if not selected_options or not option_lookup:
        return

    seen_value_ids: set[int] = set()
    for selected_option in selected_options:
        option_name = (selected_option.get("option_name") or "").strip()
        option_value = (selected_option.get("value") or "").strip()
        if not option_name or not option_value:
            continue
        linked_value = option_lookup.get((_normalize_option_token(option_name), _normalize_option_token(option_value)))
        if linked_value is None or linked_value.id in seen_value_ids:
            continue
        seen_value_ids.add(linked_value.id)
        variant.option_links.append(VariantOptionValue(option_value_id=linked_value.id))


def _inventory_variant_summary(variant: Variant) -> dict[str, Any]:
    inventory_item = variant.inventory_item
    return {
        "id": variant.id,
        "title": variant.title,
        "sku": variant.sku,
        "slug": variant.slug,
        "price": float(variant.price) if variant.price is not None else None,
        "compare_at_price": float(variant.compare_at_price) if variant.compare_at_price is not None else None,
        "stock": inventory_item.available_quantity if inventory_item else 0,
        "available_quantity": inventory_item.available_quantity if inventory_item else 0,
        "reserved_quantity": inventory_item.reserved_quantity if inventory_item else 0,
        "reorder_threshold": inventory_item.reorder_threshold if inventory_item else 10,
        "track_inventory": bool(inventory_item.track_inventory) if inventory_item else True,
        "status": variant.status or "active",
        "position": variant.position,
        "selected_options": [
            {
                "option_name": link.option_value.option.name if link.option_value and link.option_value.option else None,
                "value": link.option_value.value if link.option_value else None,
                "display_value": link.option_value.display_value if link.option_value else None,
            }
            for link in sorted(
                variant.option_links or [],
                key=lambda item: (
                    getattr(getattr(getattr(item, "option_value", None), "option", None), "position", 9999),
                    getattr(getattr(item, "option_value", None), "position", 9999),
                ),
            )
            if link.option_value
        ],
    }


def _serialize_inventory_adjustment(adjustment: InventoryAdjustment, user_names: dict[int, str] | None = None) -> dict[str, Any]:
    inventory_item = adjustment.inventory_item
    variant = inventory_item.variant if inventory_item else None
    return {
        "id": adjustment.id,
        "variant_id": variant.id if variant else None,
        "variant_title": variant.title if variant else None,
        "sku": variant.sku if variant else None,
        "delta": adjustment.delta,
        "reason": adjustment.reason,
        "reference_type": adjustment.reference_type,
        "reference_id": adjustment.reference_id,
        "performed_by": adjustment.performed_by,
        "performed_by_name": user_names.get(adjustment.performed_by) if user_names and adjustment.performed_by else None,
        "created_at": adjustment.created_at,
    }


def _recalculate_product_stock(product: Product) -> int:
    total_stock = sum(variant.inventory_item.available_quantity if variant.inventory_item else 0 for variant in product.variants)
    product.stock = total_stock
    return total_stock


def _inventory_workbench_item(product: Product, variant: Variant, inventory_item: InventoryItem) -> dict[str, Any]:
    return {
        "product_id": product.id,
        "product_name": product.name,
        "product_slug": product.slug,
        "product_status": product.status or "active",
        "category": product.category,
        "variant_id": variant.id,
        "variant_title": variant.title,
        "sku": variant.sku,
        "available_quantity": inventory_item.available_quantity or 0,
        "reserved_quantity": inventory_item.reserved_quantity or 0,
        "reorder_threshold": inventory_item.reorder_threshold or 0,
        "track_inventory": bool(inventory_item.track_inventory),
        "price": float(variant.price) if variant.price is not None else None,
        "updated_at": inventory_item.updated_at or variant.updated_at or getattr(product, "updated_at", None),
    }


def _apply_pricing_schedule_payload(
    db: Session,
    product: Product,
    payload: ScheduledPriceInput,
):
    variant = None
    if payload.variant_id is not None:
        variant = next((item for item in product.variants if item.id == payload.variant_id), None)
        if variant is None:
            raise HTTPException(status_code=404, detail="Variant not found for this product")

    starts_at = _parse_iso_datetime(payload.starts_at)
    ends_at = _parse_iso_datetime(payload.ends_at)
    if starts_at is None:
        raise HTTPException(status_code=400, detail="starts_at is required")
    if ends_at and ends_at <= starts_at:
        raise HTTPException(status_code=400, detail="ends_at must be after starts_at")

    if payload.id is not None:
        schedule = db.query(ScheduledPrice).filter(ScheduledPrice.id == payload.id).first()
        if schedule is None or schedule.product_id != product.id:
            raise HTTPException(status_code=404, detail="Pricing schedule not found for this product")
        action = "pricing_schedule.updated"
    else:
        schedule = ScheduledPrice(product_id=product.id, variant_id=variant.id if variant else None)
        db.add(schedule)
        action = "pricing_schedule.created"

    schedule.product_id = product.id
    schedule.variant_id = variant.id if variant else None
    schedule.label = payload.label
    schedule.price = payload.price
    schedule.compare_at_price = payload.compare_at_price
    schedule.starts_at = starts_at
    schedule.ends_at = ends_at
    schedule.is_active = 1 if payload.is_active else 0
    if schedule.id is None:
        db.flush()
    return schedule, variant, action


def _apply_promotion_payload(
    db: Session,
    payload: PromoCodeAdminInput,
    promo_id: int | None = None,
):
    normalized_code = payload.code.upper().strip()
    existing = db.query(PromoCode).filter(PromoCode.code == normalized_code)
    if promo_id is not None:
        existing = existing.filter(PromoCode.id != promo_id)
    if existing.first():
        raise HTTPException(status_code=400, detail="Promo code already exists")

    if promo_id is None:
        promo = PromoCode(
            code=normalized_code,
            type=payload.type,
            value=payload.value,
            description=payload.description,
            is_active=1 if payload.is_active else 0,
            expires_at=_parse_iso_datetime(payload.expires_at),
        )
        db.add(promo)
        db.flush()
        action = "promotion.created"
    else:
        promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
        if not promo:
            raise HTTPException(status_code=404, detail="Promo code not found")
        promo.code = normalized_code
        promo.type = payload.type
        promo.value = payload.value
        promo.description = payload.description
        promo.is_active = 1 if payload.is_active else 0
        promo.expires_at = _parse_iso_datetime(payload.expires_at)
        action = "promotion.updated"

    return promo, action


def _upsert_default_variant(db: Session, product: Product, desired_sku: str | None = None):
    variant = _default_variant(product)
    if variant is None:
        variant = Variant(
            product_id=product.id,
            title=product.name,
            sku=_ensure_unique_sku(db, product.id, desired_sku),
            slug=product.slug,
            price=product.price,
            compare_at_price=product.original_price,
            status=product.status or "active",
            position=1,
        )
        db.add(variant)
        db.flush()
        db.add(
            InventoryItem(
                variant_id=variant.id,
                available_quantity=product.stock or 0,
                reorder_threshold=10,
                track_inventory=1,
            )
        )
        return variant

    variant.title = product.name
    variant.sku = _ensure_unique_sku(db, product.id, desired_sku or variant.sku, variant.id)
    variant.slug = product.slug
    variant.price = product.price
    variant.compare_at_price = product.original_price
    variant.status = product.status or "active"
    variant.option_links[:] = []
    if variant.inventory_item is None:
        db.add(
            InventoryItem(
                variant_id=variant.id,
                available_quantity=product.stock or 0,
                reorder_threshold=10,
                track_inventory=1,
            )
        )
    else:
        variant.inventory_item.available_quantity = product.stock or 0
    return variant


def _sync_variants(
    db: Session,
    product: Product,
    variant_payloads: list[dict[str, Any]] | None,
    option_lookup: dict[tuple[str, str], ProductOptionValue] | None = None,
):
    if variant_payloads == []:
        default_variant = _upsert_default_variant(db, product)
        for variant in list(product.variants):
            if default_variant.id and variant.id != default_variant.id:
                db.delete(variant)
        product.product_type = "simple"
        return default_variant
    if variant_payloads is None:
        return _upsert_default_variant(db, product)

    existing_by_id = {variant.id: variant for variant in product.variants}
    keep_ids: set[int] = set()

    for index, payload in enumerate(variant_payloads, start=1):
        variant_id = payload.get("id")
        variant = existing_by_id.get(variant_id) if variant_id else None

        if variant is None:
            variant = Variant(product_id=product.id)
            db.add(variant)
            db.flush()

        variant.title = payload.get("title") or f"{product.name} Variant {index}"
        variant.sku = _ensure_unique_sku(db, product.id, payload.get("sku"), variant.id if variant.id else None)
        variant.slug = slugify(payload.get("slug") or variant.title)
        variant.price = payload.get("price", product.price)
        variant.compare_at_price = payload.get("compare_at_price")
        variant.status = payload.get("status") or product.status or "active"
        variant.position = payload.get("position") or index
        _assign_variant_option_links(variant, payload.get("selected_options"), option_lookup)

        stock = payload.get("stock", 0) or 0
        if variant.inventory_item is None:
            db.add(
                InventoryItem(
                    variant_id=variant.id,
                    available_quantity=stock,
                    reorder_threshold=10,
                    track_inventory=1,
                )
            )
        else:
            variant.inventory_item.available_quantity = stock

        db.flush()
        keep_ids.add(variant.id)

    for variant in list(product.variants):
        if variant.id not in keep_ids:
            db.delete(variant)

    refreshed_variants = [variant for variant in product.variants if variant.id in keep_ids]
    if not refreshed_variants:
        return _upsert_default_variant(db, product)

    refreshed_variants.sort(key=lambda variant: (variant.position or 9999, variant.id or 0))
    default_variant = refreshed_variants[0]
    total_stock = sum(variant.inventory_item.available_quantity if variant.inventory_item else 0 for variant in refreshed_variants)
    product.stock = total_stock
    product.price = default_variant.price
    product.original_price = default_variant.compare_at_price
    product.product_type = "configurable" if len(refreshed_variants) > 1 else (product.product_type or "simple")
    return default_variant


@router.get("/stats", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_dashboard_stats(db: Session = Depends(get_db)):
    revenue = db.query(func.sum(Order.total_amount)).filter(Order.status != "cancelled").scalar() or 0
    orders_count = db.query(Order).count()
    customers_count = db.query(User).filter(User.role == "customer").count()
    low_stock = db.query(Product).filter(Product.stock < 10).count()
    return {
        "revenue": revenue,
        "orders_count": orders_count,
        "customers_count": customers_count,
        "low_stock_count": low_stock,
    }


@router.get("/orders", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    result = []
    for order in orders:
        customer_email = order.user.email if order.user else (order.guest_email or "Guest")
        customer_name = f"{order.user.first_name} {order.user.last_name}" if order.user else (order.guest_name or "Guest Customer")
        result.append(
            {
                "id": order.id,
                "user_id": order.user_id,
                "user_email": customer_email,
                "customer_name": customer_name,
                "total_amount": order.total_amount,
                "status": order.status,
                "shipping_address": order.shipping_address,
                "payment_method": order.payment_method,
                "created_at": order.created_at,
            }
        )
    return result


@router.get("/orders/{order_id}", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_order_details(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = []
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items.append(
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name if product else "Deleted Product",
                "image": product.images.split(",")[0] if product and product.images else None,
                "quantity": item.quantity,
                "price": item.price,
                "color": item.color,
                "size": item.size,
            }
        )

    customer_email = order.user.email if order.user else (order.guest_email or "Guest")
    customer_name = f"{order.user.first_name} {order.user.last_name}" if order.user else (order.guest_name or "Guest Customer")
    return {
        "id": order.id,
        "user_id": order.user_id,
        "user_email": customer_email,
        "customer_name": customer_name,
        "total_amount": order.total_amount,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "payment_method": order.payment_method,
        "created_at": order.created_at,
        "items": items,
    }


@router.patch("/orders/{order_id}/status", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status_update.status
    db.commit()
    return {"message": "Order status updated", "new_status": status_update.status}


@router.get("/products", response_model=PaginatedAdminProducts, dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_admin_products(
    q: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    collection_id: int | None = None,
    is_featured: bool | None = None,
    status: str | None = None,
    stock: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = "updated-desc",
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    limit = min(max(limit, 1), 100)

    query = _admin_product_query(db)
    if q:
        search = f"%{q.strip().lower()}%"
        query = query.filter(
            Product.name.ilike(search)
            | Product.category.ilike(search)
            | Product.slug.ilike(search)
            | Product.id.cast(String).ilike(search)
        )
    if category and category != "all":
        query = query.filter(Product.category == category)
    if brand and brand != "all":
        query = query.filter(Product.brand == brand)
    if collection_id is not None:
        query = query.filter(Product.collection_id == collection_id)
    if is_featured is not None:
        query = query.filter(Product.is_featured == (1 if is_featured else 0))
    if status and status != "all":
        query = query.filter(Product.status == status)
    if stock == "low":
        query = query.filter(Product.stock > 0, Product.stock < 10)
    elif stock == "out":
        query = query.filter(Product.stock <= 0)
    elif stock == "healthy":
        query = query.filter(Product.stock >= 10)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort == "name-asc":
        query = query.order_by(Product.name.asc())
    elif sort == "price-asc":
        query = query.order_by(Product.price.asc(), Product.id.asc())
    elif sort == "price-desc":
        query = query.order_by(Product.price.desc(), Product.id.asc())
    elif sort == "created-desc":
        query = query.order_by(Product.created_at.desc(), Product.id.desc())
    else:
        query = query.order_by(Product.updated_at.desc().nullslast(), Product.id.desc())

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [_admin_product_list_item(product) for product in products],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }


@router.get("/inventory/items", response_model=PaginatedInventoryWorkbench, dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_inventory_workbench_items(
    q: str | None = None,
    category: str | None = None,
    stock: str | None = None,
    tracked: str = "tracked",
    sort: str = "stock-asc",
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    limit = min(max(limit, 1), 100)

    query = (
        db.query(Product, Variant, InventoryItem)
        .join(Variant, Variant.product_id == Product.id)
        .join(InventoryItem, InventoryItem.variant_id == Variant.id)
    )

    if q:
        search = f"%{q.strip().lower()}%"
        query = query.filter(
            Product.name.ilike(search)
            | Product.slug.ilike(search)
            | Product.category.ilike(search)
            | Variant.title.ilike(search)
            | Variant.sku.ilike(search)
        )
    if category and category != "all":
        query = query.filter(Product.category == category)
    if stock == "low":
        query = query.filter(InventoryItem.available_quantity > 0, InventoryItem.available_quantity <= InventoryItem.reorder_threshold)
    elif stock == "out":
        query = query.filter(InventoryItem.available_quantity <= 0)
    elif stock == "healthy":
        query = query.filter(InventoryItem.available_quantity > InventoryItem.reorder_threshold)
    if tracked == "tracked":
        query = query.filter(InventoryItem.track_inventory == 1)
    elif tracked == "untracked":
        query = query.filter(InventoryItem.track_inventory != 1)

    if sort == "name-asc":
        query = query.order_by(Product.name.asc(), Variant.position.asc(), Variant.id.asc())
    elif sort == "stock-desc":
        query = query.order_by(InventoryItem.available_quantity.desc(), Product.name.asc())
    elif sort == "updated-desc":
        query = query.order_by(InventoryItem.updated_at.desc().nullslast(), Product.name.asc())
    else:
        query = query.order_by(InventoryItem.available_quantity.asc(), Product.name.asc(), Variant.position.asc())

    total = query.count()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    summary_rows = (
        db.query(InventoryItem)
        .join(Variant, Variant.id == InventoryItem.variant_id)
        .join(Product, Product.id == Variant.product_id)
    )
    if q:
        search = f"%{q.strip().lower()}%"
        summary_rows = summary_rows.filter(
            Product.name.ilike(search)
            | Product.slug.ilike(search)
            | Product.category.ilike(search)
            | Variant.title.ilike(search)
            | Variant.sku.ilike(search)
        )
    if category and category != "all":
        summary_rows = summary_rows.filter(Product.category == category)
    if stock == "low":
        summary_rows = summary_rows.filter(InventoryItem.available_quantity > 0, InventoryItem.available_quantity <= InventoryItem.reorder_threshold)
    elif stock == "out":
        summary_rows = summary_rows.filter(InventoryItem.available_quantity <= 0)
    elif stock == "healthy":
        summary_rows = summary_rows.filter(InventoryItem.available_quantity > InventoryItem.reorder_threshold)
    if tracked == "tracked":
        summary_rows = summary_rows.filter(InventoryItem.track_inventory == 1)
    elif tracked == "untracked":
        summary_rows = summary_rows.filter(InventoryItem.track_inventory != 1)

    summary_items = summary_rows.all()
    return {
        "items": [_inventory_workbench_item(product, variant, inventory_item) for product, variant, inventory_item in rows],
        "summary": {
            "tracked_items": sum(1 for item in summary_items if item.track_inventory == 1),
            "total_on_hand": sum(item.available_quantity or 0 for item in summary_items),
            "low_stock_count": sum(1 for item in summary_items if (item.available_quantity or 0) > 0 and (item.available_quantity or 0) <= (item.reorder_threshold or 0)),
            "out_of_stock_count": sum(1 for item in summary_items if (item.available_quantity or 0) <= 0),
        },
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }


@router.get("/audit-logs", response_model=PaginatedAdminAuditLogs, dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_audit_logs(
    entity_types: str | None = None,
    entity_id: int | None = None,
    action: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    page = max(page, 1)
    limit = min(max(limit, 1), 100)

    query = db.query(AdminAuditLog)

    if entity_types:
        selected_types = [item.strip() for item in entity_types.split(",") if item.strip()]
        if selected_types:
            query = query.filter(AdminAuditLog.entity_type.in_(selected_types))
    if entity_id is not None:
        query = query.filter(AdminAuditLog.entity_id == entity_id)
    if action:
        query = query.filter(AdminAuditLog.action == action)

    query = query.order_by(AdminAuditLog.created_at.desc(), AdminAuditLog.id.desc())
    total = query.count()
    logs = query.offset((page - 1) * limit).limit(limit).all()

    performer_ids = {log.performed_by for log in logs if log.performed_by}
    user_names = {}
    if performer_ids:
        user_names = {
            user.id: f"{user.first_name} {user.last_name}".strip() or user.email
            for user in db.query(User).filter(User.id.in_(performer_ids)).all()
        }

    return {
        "items": [_serialize_audit_log(log, user_names) for log in logs],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }


@router.get("/approvals", response_model=PaginatedAdminApprovalRequests, dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_approval_requests(
    status: str = "pending",
    entity_types: str | None = None,
    stale_only: bool = False,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    page = max(page, 1)
    limit = min(max(limit, 1), 100)

    query = db.query(AdminApprovalRequest)
    if current_user.role == "manager":
        query = query.filter(AdminApprovalRequest.requested_by == current_user.id)
    if status and status != "all":
        query = query.filter(AdminApprovalRequest.status == status)
    if entity_types:
        selected_types = [item.strip() for item in entity_types.split(",") if item.strip()]
        if selected_types:
            query = query.filter(AdminApprovalRequest.entity_type.in_(selected_types))

    query = query.order_by(AdminApprovalRequest.created_at.desc(), AdminApprovalRequest.id.desc())
    items = query.all()
    if stale_only:
        items = [item for item in items if _approval_is_stale(item)]
    total = len(items)
    items = items[(page - 1) * limit: page * limit]

    user_ids = {
        user_id
        for item in items
        for user_id in [item.requested_by, item.reviewed_by]
        if user_id
    }
    user_names = {}
    if user_ids:
        user_names = {
            user.id: f"{user.first_name} {user.last_name}".strip() or user.email
            for user in db.query(User).filter(User.id.in_(user_ids)).all()
        }

    return {
        "items": [_serialize_approval_request(item, user_names) for item in items],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }


@router.get("/notifications/summary", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_notification_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        scope_query = db.query(AdminApprovalRequest)
    elif current_user.role == "manager":
        scope_query = db.query(AdminApprovalRequest).filter(AdminApprovalRequest.requested_by == current_user.id)
    else:
        return {
            "pending_count": 0,
            "stale_count": 0,
            "recent_items": [],
            "scope": "viewer",
            "sla_hours": APPROVAL_SLA_HOURS,
        }

    pending_requests = scope_query.filter(AdminApprovalRequest.status == "pending").all()
    stale_count = sum(1 for item in pending_requests if _approval_is_stale(item))
    recent_items = (
        scope_query
        .order_by(AdminApprovalRequest.created_at.desc(), AdminApprovalRequest.id.desc())
        .limit(5)
        .all()
    )

    user_ids = {
        user_id
        for item in recent_items
        for user_id in [item.requested_by, item.reviewed_by]
        if user_id
    }
    user_names = {}
    if user_ids:
        user_names = {
            user.id: f"{user.first_name} {user.last_name}".strip() or user.email
            for user in db.query(User).filter(User.id.in_(user_ids)).all()
        }

    return {
        "pending_count": len(pending_requests),
        "stale_count": stale_count,
        "recent_items": [_serialize_approval_request(item, user_names) for item in recent_items],
        "scope": current_user.role,
        "sla_hours": APPROVAL_SLA_HOURS,
    }


@router.post("/approvals/{approval_id}/approve", dependencies=[Depends(require_role(["admin"]))])
async def approve_approval_request(
    approval_id: int,
    decision: ApprovalDecisionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval_request = db.query(AdminApprovalRequest).filter(AdminApprovalRequest.id == approval_id).first()
    if not approval_request:
        raise HTTPException(status_code=404, detail="Approval request not found")
    if approval_request.status != "pending":
        raise HTTPException(status_code=400, detail="Approval request has already been reviewed")

    payload = json.loads(approval_request.payload_json)

    if approval_request.action in {"pricing_schedule.created", "pricing_schedule.updated"}:
        product_id = payload.get("product_id")
        if not product_id:
            raise HTTPException(status_code=400, detail="Approval payload is missing product_id")
        product = _admin_product_query(db).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        schedule_payload = ScheduledPriceInput(**payload)
        schedule, variant, action = _apply_pricing_schedule_payload(db, product, schedule_payload)
        _log_admin_event(
            db,
            action=action,
            entity_type="pricing_schedule",
            entity_id=schedule.id,
            entity_label=schedule.label or (variant.title if variant else product.name),
            summary=f"{'Updated' if action.endswith('updated') else 'Created'} pricing schedule for {variant.title if variant else product.name}",
            current_user=current_user,
            metadata={
                "product_id": product.id,
                "product_name": product.name,
                "variant_id": variant.id if variant else None,
                "variant_title": variant.title if variant else None,
                "price": payload.get("price"),
                "compare_at_price": payload.get("compare_at_price"),
                "starts_at": payload.get("starts_at"),
                "ends_at": payload.get("ends_at"),
                "approved_from_request_id": approval_request.id,
            },
        )
        await invalidate_product_cache([product.id])
    elif approval_request.action == "pricing_schedule.deleted":
        schedule = db.query(ScheduledPrice).filter(ScheduledPrice.id == approval_request.entity_id).first()
        if not schedule:
            raise HTTPException(status_code=404, detail="Pricing schedule not found")
        product_id = schedule.product_id
        summary_target = schedule.label or f"Schedule #{schedule.id}"
        _log_admin_event(
            db,
            action="pricing_schedule.deleted",
            entity_type="pricing_schedule",
            entity_id=schedule.id,
            entity_label=summary_target,
            summary=f"Deleted pricing schedule {summary_target}",
            current_user=current_user,
            metadata={
                "product_id": schedule.product_id,
                "variant_id": schedule.variant_id,
                "approved_from_request_id": approval_request.id,
            },
        )
        db.delete(schedule)
        await invalidate_product_cache([product_id] if product_id else None)
    elif approval_request.action in {"promotion.created", "promotion.updated"}:
        promo_payload = PromoCodeAdminInput(**payload)
        promo, action = _apply_promotion_payload(db, promo_payload, approval_request.entity_id if approval_request.action == "promotion.updated" else None)
        _log_admin_event(
            db,
            action=action,
            entity_type="promotion",
            entity_id=promo.id,
            entity_label=promo.code,
            summary=f"{'Updated' if action.endswith('updated') else 'Created'} promo code {promo.code}",
            current_user=current_user,
            metadata={
                "type": promo.type,
                "value": float(promo.value),
                "is_active": bool(promo.is_active),
                "expires_at": promo.expires_at.isoformat() if promo.expires_at else None,
                "approved_from_request_id": approval_request.id,
            },
        )
        approval_request.entity_id = promo.id
    elif approval_request.action == "promotion.deleted":
        promo = db.query(PromoCode).filter(PromoCode.id == approval_request.entity_id).first()
        if not promo:
            raise HTTPException(status_code=404, detail="Promo code not found")
        _log_admin_event(
            db,
            action="promotion.deleted",
            entity_type="promotion",
            entity_id=promo.id,
            entity_label=promo.code,
            summary=f"Deleted promo code {promo.code}",
            current_user=current_user,
            metadata={
                "type": promo.type,
                "value": float(promo.value),
                "is_active": bool(promo.is_active),
                "approved_from_request_id": approval_request.id,
            },
        )
        db.delete(promo)
    else:
        raise HTTPException(status_code=400, detail="Unsupported approval action")

    approval_request.status = "approved"
    approval_request.reviewed_by = current_user.id
    approval_request.review_notes = decision.review_notes
    approval_request.reviewed_at = datetime.now(timezone.utc)
    _log_admin_event(
        db,
        action="approval.approved",
        entity_type="approval_request",
        entity_id=approval_request.id,
        entity_label=approval_request.summary,
        summary=f"Approved request: {approval_request.summary}",
        current_user=current_user,
        metadata={"review_notes": decision.review_notes},
    )
    db.commit()

    user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
    requester = db.query(User).filter(User.id == approval_request.requested_by).first()
    if requester:
        user_names[requester.id] = f"{requester.first_name} {requester.last_name}".strip() or requester.email
    return _serialize_approval_request(approval_request, user_names)


@router.post("/approvals/{approval_id}/reject", dependencies=[Depends(require_role(["admin"]))])
async def reject_approval_request(
    approval_id: int,
    decision: ApprovalDecisionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    approval_request = db.query(AdminApprovalRequest).filter(AdminApprovalRequest.id == approval_id).first()
    if not approval_request:
        raise HTTPException(status_code=404, detail="Approval request not found")
    if approval_request.status != "pending":
        raise HTTPException(status_code=400, detail="Approval request has already been reviewed")

    approval_request.status = "rejected"
    approval_request.reviewed_by = current_user.id
    approval_request.review_notes = decision.review_notes
    approval_request.reviewed_at = datetime.now(timezone.utc)
    _log_admin_event(
        db,
        action="approval.rejected",
        entity_type="approval_request",
        entity_id=approval_request.id,
        entity_label=approval_request.summary,
        summary=f"Rejected request: {approval_request.summary}",
        current_user=current_user,
        metadata={"review_notes": decision.review_notes},
    )
    db.commit()

    user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
    requester = db.query(User).filter(User.id == approval_request.requested_by).first()
    if requester:
        user_names[requester.id] = f"{requester.first_name} {requester.last_name}".strip() or requester.email
    return _serialize_approval_request(approval_request, user_names)


@router.get("/products/{product_id}", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_admin_product(product_id: int, db: Session = Depends(get_db)):
    product = _admin_product_query(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(product)


@router.post("/products/{product_id}/pricing-schedules", dependencies=[Depends(require_role(["admin", "manager"]))])
async def upsert_product_pricing_schedule(
    product_id: int,
    payload: ScheduledPriceInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _admin_product_query(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if current_user.role == "manager":
        variant = next((item for item in product.variants if item.id == payload.variant_id), None) if payload.variant_id else None
        approval_request = _create_approval_request(
            db,
            entity_type="pricing_schedule",
            entity_id=payload.id,
            action="pricing_schedule.updated" if payload.id else "pricing_schedule.created",
            summary=f"{'Update' if payload.id else 'Create'} pricing schedule for {variant.title if variant else product.name}",
            payload={**payload.model_dump(), "product_id": product.id},
            current_user=current_user,
        )
        db.commit()
        user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
        return {
            "status": "pending_approval",
            "message": "Pricing schedule submitted for admin approval",
            "approval_request": _serialize_approval_request(approval_request, user_names),
        }

    schedule, variant, action = _apply_pricing_schedule_payload(db, product, payload)
    _log_admin_event(
        db,
        action=action,
        entity_type="pricing_schedule",
        entity_id=schedule.id,
        entity_label=payload.label or (variant.title if variant else product.name),
        summary=f"{'Updated' if action.endswith('updated') else 'Created'} pricing schedule for {variant.title if variant else product.name}",
        current_user=current_user,
        metadata={
            "product_id": product.id,
            "product_name": product.name,
            "variant_id": variant.id if variant else None,
            "variant_title": variant.title if variant else None,
            "price": payload.price,
            "compare_at_price": payload.compare_at_price,
            "starts_at": schedule.starts_at.isoformat() if schedule.starts_at else None,
            "ends_at": schedule.ends_at.isoformat() if schedule.ends_at else None,
            "is_active": payload.is_active,
        },
    )

    db.commit()
    db.refresh(schedule)
    await invalidate_product_cache([product.id])
    return _serialize_scheduled_price(schedule)


@router.delete("/pricing-schedules/{schedule_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_pricing_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    schedule = db.query(ScheduledPrice).filter(ScheduledPrice.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Pricing schedule not found")

    if current_user.role == "manager":
        approval_request = _create_approval_request(
            db,
            entity_type="pricing_schedule",
            entity_id=schedule.id,
            action="pricing_schedule.deleted",
            summary=f"Delete pricing schedule {schedule.label or f'#{schedule.id}'}",
            payload={
                "schedule_id": schedule.id,
                "product_id": schedule.product_id,
                "variant_id": schedule.variant_id,
                "label": schedule.label,
            },
            current_user=current_user,
        )
        db.commit()
        user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
        return {
            "status": "pending_approval",
            "message": "Pricing schedule deletion submitted for admin approval",
            "approval_request": _serialize_approval_request(approval_request, user_names),
        }

    product_id = schedule.product_id
    summary_target = schedule.label or f"Schedule #{schedule.id}"
    _log_admin_event(
        db,
        action="pricing_schedule.deleted",
        entity_type="pricing_schedule",
        entity_id=schedule.id,
        entity_label=summary_target,
        summary=f"Deleted pricing schedule {summary_target}",
        current_user=current_user,
        metadata={
            "product_id": schedule.product_id,
            "variant_id": schedule.variant_id,
            "price": float(schedule.price) if schedule.price is not None else None,
            "compare_at_price": float(schedule.compare_at_price) if schedule.compare_at_price is not None else None,
            "starts_at": schedule.starts_at.isoformat() if schedule.starts_at else None,
            "ends_at": schedule.ends_at.isoformat() if schedule.ends_at else None,
        },
    )
    db.delete(schedule)
    db.commit()
    await invalidate_product_cache([product_id] if product_id else None)
    return {"message": "Pricing schedule deleted"}


@router.get(
    "/products/{product_id}/inventory-history",
    response_model=InventoryHistoryResponse,
    dependencies=[Depends(require_role(["admin", "manager", "viewer"]))],
)
async def get_product_inventory_history(product_id: int, limit: int = 25, db: Session = Depends(get_db)):
    product = db.query(Product.id).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    limit = min(max(limit, 1), 100)
    adjustments = (
        db.query(InventoryAdjustment)
        .join(InventoryItem, InventoryAdjustment.inventory_item_id == InventoryItem.id)
        .join(Variant, InventoryItem.variant_id == Variant.id)
        .options(joinedload(InventoryAdjustment.inventory_item).joinedload(InventoryItem.variant))
        .filter(Variant.product_id == product_id)
        .order_by(InventoryAdjustment.created_at.desc(), InventoryAdjustment.id.desc())
        .limit(limit)
        .all()
    )
    performer_ids = {adjustment.performed_by for adjustment in adjustments if adjustment.performed_by}
    user_names = {}
    if performer_ids:
        user_names = {
            user.id: f"{user.first_name} {user.last_name}".strip() or user.email
            for user in db.query(User).filter(User.id.in_(performer_ids)).all()
        }

    return {
        "product_id": product_id,
        "items": [_serialize_inventory_adjustment(adjustment, user_names) for adjustment in adjustments],
    }


@router.post(
    "/products/{product_id}/inventory-adjustments",
    response_model=InventoryAdjustmentResult,
    dependencies=[Depends(require_role(["admin", "manager"]))],
)
async def adjust_product_inventory(
    product_id: int,
    adjustment_request: InventoryAdjustmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _admin_product_query(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    variant = next((item for item in product.variants if item.id == adjustment_request.variant_id), None)
    if variant is None:
        raise HTTPException(status_code=404, detail="Variant not found for this product")

    if variant.inventory_item is None:
        inventory_item = InventoryItem(
            variant_id=variant.id,
            available_quantity=0,
            reserved_quantity=0,
            reorder_threshold=10,
            track_inventory=1,
        )
        db.add(inventory_item)
        db.flush()
        variant.inventory_item = inventory_item
    else:
        inventory_item = variant.inventory_item
    current_quantity = inventory_item.available_quantity or 0

    if adjustment_request.reorder_threshold is not None:
        inventory_item.reorder_threshold = adjustment_request.reorder_threshold
    if adjustment_request.track_inventory is not None:
        inventory_item.track_inventory = 1 if adjustment_request.track_inventory else 0

    if adjustment_request.adjustment_type == "increase":
        delta = adjustment_request.quantity
    elif adjustment_request.adjustment_type == "decrease":
        delta = -adjustment_request.quantity
    else:
        delta = adjustment_request.quantity - current_quantity

    next_quantity = current_quantity + delta
    if next_quantity < 0:
        raise HTTPException(status_code=400, detail="Inventory cannot go below zero")

    inventory_item.available_quantity = next_quantity
    _recalculate_product_stock(product)

    adjustment = None
    if delta != 0:
        adjustment = InventoryAdjustment(
            inventory_item_id=inventory_item.id,
            delta=delta,
            reason=adjustment_request.reason,
            reference_type=adjustment_request.reference_type,
            reference_id=adjustment_request.reference_id,
            performed_by=current_user.id,
        )
        db.add(adjustment)
        _log_admin_event(
            db,
            action="inventory.adjusted",
            entity_type="inventory_item",
            entity_id=inventory_item.id,
            entity_label=variant.sku,
            summary=f"Adjusted inventory for {variant.title} by {delta:+d}",
            current_user=current_user,
            metadata={
                "product_id": product.id,
                "product_name": product.name,
                "variant_id": variant.id,
                "variant_title": variant.title,
                "sku": variant.sku,
                "delta": delta,
                "previous_quantity": current_quantity,
                "new_quantity": next_quantity,
                "reason": adjustment_request.reason,
                "reference_type": adjustment_request.reference_type,
                "reference_id": adjustment_request.reference_id,
                "reorder_threshold": inventory_item.reorder_threshold,
            },
        )

    db.commit()
    db.refresh(product)
    db.refresh(variant)
    db.refresh(inventory_item)
    if adjustment is not None:
        db.refresh(adjustment)

    await invalidate_product_cache([product.id])

    user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
    return {
        "product_id": product.id,
        "product_stock": product.stock or 0,
        "variant": _inventory_variant_summary(variant),
        "adjustment": _serialize_inventory_adjustment(adjustment, user_names) if adjustment else None,
    }


@router.post("/products", dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_product(
    p_schema: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slug = _ensure_unique_product_slug(db, p_schema.name, p_schema.slug)
    new_product = Product(
        name=p_schema.name,
        slug=slug,
        product_type=p_schema.product_type or ("configurable" if p_schema.variants and len(p_schema.variants) > 1 else "simple"),
        price=p_schema.price,
        original_price=p_schema.original_price,
        description=p_schema.description,
        short_description=getattr(p_schema, "short_description", None),
        brand=getattr(p_schema, "brand", None),
        category=p_schema.category,
        category_id=getattr(p_schema, "category_id", None),
        subcategory=p_schema.subcategory,
        is_featured=1 if getattr(p_schema, "is_featured", False) else 0,
        stock=p_schema.stock,
        images=",".join(p_schema.images),
        colors=",".join(p_schema.colors),
        sizes=",".join(p_schema.sizes),
        badge=p_schema.badge,
        sale_percent=p_schema.sale_percent,
        rating=p_schema.rating,
        reviews=p_schema.reviews,
        specs=_serialize_specs(p_schema.specs),
        materials=",".join(p_schema.materials) if p_schema.materials else None,
        configurations=",".join(p_schema.configurations) if p_schema.configurations else None,
        colorNames=",".join(p_schema.colorNames) if p_schema.colorNames else None,
        is_canadian_made=1 if p_schema.is_canadian_made else 0,
        status=p_schema.status,
    )
    db.add(new_product)
    db.flush()
    option_lookup = _sync_product_options(
        db,
        new_product,
        [option.model_dump() for option in p_schema.options] if p_schema.options else [],
    )
    _sync_variants(
        db,
        new_product,
        [variant.model_dump() for variant in p_schema.variants] if p_schema.variants else None,
        option_lookup,
    )
    if not p_schema.variants:
        _upsert_default_variant(db, new_product, p_schema.sku)
    db.add(
        ProductSEO(
            product_id=new_product.id,
            meta_title=(p_schema.seo.meta_title if p_schema.seo else None) or new_product.name,
            meta_description=(p_schema.seo.meta_description if p_schema.seo else None) or (new_product.description or "")[:160] or None,
            canonical_url=p_schema.seo.canonical_url if p_schema.seo else None,
            robots_directive=p_schema.seo.robots_directive if p_schema.seo else None,
        )
    )
    _log_admin_event(
        db,
        action="product.created",
        entity_type="product",
        entity_id=new_product.id,
        entity_label=new_product.name,
        summary=f"Created product {new_product.name}",
        current_user=current_user,
        metadata={
            "slug": new_product.slug,
            "product_type": new_product.product_type,
            "category": new_product.category,
            "variant_count": len(new_product.variants or []),
        },
    )
    db.commit()
    db.refresh(new_product)
    await invalidate_product_cache([new_product.id])
    return {"id": new_product.id, "slug": new_product.slug, "message": "Product created successfully"}


@router.put("/products/{product_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_product(
    product_id: int,
    p_schema: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = _admin_product_query(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    payload = p_schema.model_dump(exclude_unset=True)
    list_fields = {"images", "colors", "sizes", "materials", "configurations", "colorNames"}

    if "name" in payload or "slug" in payload:
        payload["slug"] = _ensure_unique_product_slug(db, payload.get("name", product.name), payload.get("slug", product.slug), product.id)

    seo_payload = payload.pop("seo", None)
    desired_sku = payload.pop("sku", None)
    options_payload = payload.pop("options", None)
    variants_payload = payload.pop("variants", None)

    for key, value in payload.items():
        if key in list_fields:
            setattr(product, key, ",".join(value) if value else "")
        elif key == "specs":
            setattr(product, key, _serialize_specs(value))
        elif key in ("is_canadian_made", "is_featured"):
            setattr(product, key, 1 if value else 0)
        else:
            setattr(product, key, value)

    option_lookup = _sync_product_options(db, product, options_payload)

    if variants_payload is not None:
        _sync_variants(db, product, variants_payload, option_lookup)
    else:
        _upsert_default_variant(db, product, desired_sku)

    if seo_payload is not None:
        if product.seo is None:
            product.seo = ProductSEO(product_id=product.id)
        if seo_payload.meta_title is not None:
            product.seo.meta_title = seo_payload.meta_title
        if seo_payload.meta_description is not None:
            product.seo.meta_description = seo_payload.meta_description
        if seo_payload.canonical_url is not None:
            product.seo.canonical_url = seo_payload.canonical_url
        if seo_payload.robots_directive is not None:
            product.seo.robots_directive = seo_payload.robots_directive

    _log_admin_event(
        db,
        action="product.updated",
        entity_type="product",
        entity_id=product.id,
        entity_label=product.name,
        summary=f"Updated product {product.name}",
        current_user=current_user,
        metadata={
            "slug": product.slug,
            "product_type": product.product_type,
            "status": product.status,
            "variant_count": len(product.variants or []),
            "updated_fields": sorted(payload.keys()),
        },
    )
    db.commit()
    await invalidate_product_cache([product_id])
    return {"message": "Product updated successfully", "slug": product.slug}


def _apply_bulk_filters(db: Session, filters: BulkStatusUpdate | BulkPriceUpdate | BulkActionRequest):
    query = db.query(Product.id)
    if not filters.filters:
        if filters.ids:
            return query.filter(Product.id.in_(filters.ids))
        return None

    f = filters.filters
    if f.q:
        search = f"%{f.q.strip().lower()}%"
        query = query.filter(Product.name.ilike(search) | Product.category.ilike(search) | Product.slug.ilike(search))
    if f.category and f.category != "all":
        query = query.filter(Product.category == f.category)
    if f.brand and f.brand != "all":
        query = query.filter(Product.brand == f.brand)
    if f.collection_id is not None:
        query = query.filter(Product.collection_id == f.collection_id)
    if f.is_featured is not None:
        query = query.filter(Product.is_featured == (1 if f.is_featured else 0))
    if f.status and f.status != "all":
        query = query.filter(Product.status == f.status)
    if f.stock == "low":
        query = query.filter(Product.stock > 0, Product.stock < 10)
    elif f.stock == "out":
        query = query.filter(Product.stock <= 0)
    elif f.stock == "healthy":
        query = query.filter(Product.stock >= 10)
    if f.min_price is not None:
        query = query.filter(Product.price >= f.min_price)
    if f.max_price is not None:
        query = query.filter(Product.price <= f.max_price)

    return query


@router.post("/products/bulk-delete", dependencies=[Depends(require_role(["admin", "manager"]))])
async def bulk_delete_products(request: BulkActionRequest, db: Session = Depends(get_db)):
    query = _apply_bulk_filters(db, request)
    if query is None:
        return {"message": "No IDs or filters provided"}

    ids_to_delete = [row[0] for row in query.all()]
    if not ids_to_delete:
        return {"message": "No products match criteria"}

    db.query(Product).filter(Product.id.in_(ids_to_delete)).delete(synchronize_session=False)
    db.commit()
    await invalidate_product_cache(ids_to_delete)
    return {"message": f"Successfully deleted {len(ids_to_delete)} products"}


@router.post("/products/bulk-status", dependencies=[Depends(require_role(["admin", "manager"]))])
async def bulk_status_products(request: BulkStatusUpdate, db: Session = Depends(get_db)):
    if request.status not in ["active", "draft", "archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    query = _apply_bulk_filters(db, request)
    if query is None:
        return {"message": "No IDs or filters provided"}

    ids_to_update = [row[0] for row in query.all()]
    if not ids_to_update:
        return {"message": "No products match criteria"}

    db.query(Product).filter(Product.id.in_(ids_to_update)).update({"status": request.status}, synchronize_session=False)
    db.query(Variant).filter(Variant.product_id.in_(ids_to_update)).update({"status": request.status}, synchronize_session=False)
    db.commit()
    await invalidate_product_cache(ids_to_update)
    return {"message": f"Successfully updated {len(ids_to_update)} products to {request.status}"}


@router.post("/products/bulk-price", dependencies=[Depends(require_role(["admin", "manager"]))])
async def bulk_price_update(request: BulkPriceUpdate, db: Session = Depends(get_db)):
    query = _apply_bulk_filters(db, request)
    if query is None:
        return {"message": "No IDs or filters provided"}

    ids_to_update = [row[0] for row in query.all()]
    if not ids_to_update:
        return {"message": "No products match criteria"}

    products = _admin_product_query(db).filter(Product.id.in_(ids_to_update)).all()
    for product in products:
        current_price = float(product.price or 0)
        if request.percentage is not None:
            new_price = current_price * (1.0 + (float(request.percentage) / 100.0))
        elif request.fixed_adjustment is not None:
            new_price = current_price + float(request.fixed_adjustment)
        else:
            continue
        product.price = new_price
        variant = _default_variant(product)
        if variant:
            variant.price = new_price

    db.commit()
    await invalidate_product_cache(ids_to_update)
    return {"message": f"Successfully updated prices for {len(ids_to_update)} products"}


@router.delete("/products/{product_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        _log_admin_event(
            db,
            action="product.deleted",
            entity_type="product",
            entity_id=product.id,
            entity_label=product.name,
            summary=f"Deleted product {product.name}",
            current_user=current_user,
            metadata={"slug": product.slug, "category": product.category},
        )
        db.delete(product)
        db.commit()
        await invalidate_product_cache([product_id])
    return {"message": "Product deleted successfully"}


@router.get("/analytics/sales", dependencies=[Depends(require_role(["admin"]))])
async def get_sales_analytics(db: Session = Depends(get_db)):
    is_postgres = "postgresql" in str(db.bind.dialect.name)
    if is_postgres:
        sql = """
            SELECT CAST(created_at AS DATE) as day, SUM(total_amount) as revenue, COUNT(id) as orders
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY day
            ORDER BY day ASC
        """
    else:
        sql = """
            SELECT date(created_at) as day, SUM(total_amount) as revenue, COUNT(id) as orders
            FROM orders
            WHERE status != 'cancelled'
            AND created_at >= date('now', '-30 days')
            GROUP BY day
            ORDER BY day ASC
        """

    revenue_trend = [dict(row._mapping) for row in db.execute(text(sql)).fetchall()]
    category_sales = [
        dict(row._mapping)
        for row in db.execute(
            text(
                """
                SELECT p.category, SUM(oi.price * oi.quantity) as value, COUNT(oi.id) as units
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status != 'cancelled'
                GROUP BY p.category
                """
            )
        ).fetchall()
    ]
    top_products = [
        dict(row._mapping)
        for row in db.execute(
            text(
                """
                SELECT p.name, SUM(oi.price * oi.quantity) as value
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status != 'cancelled'
                GROUP BY p.id
                ORDER BY value DESC
                LIMIT 5
                """
            )
        ).fetchall()
    ]
    return {"revenue_trend": revenue_trend, "category_sales": category_sales, "top_products": top_products}


@router.get("/customers", dependencies=[Depends(require_role(["admin"]))])
async def get_all_customers(db: Session = Depends(get_db)):
    customers = (
        db.query(
            User.id,
            User.email,
            User.first_name,
            User.last_name,
            User.created_at,
            func.count(Order.id).label("total_orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total_spent"),
        )
        .outerjoin(Order, and_(User.id == Order.user_id, Order.status != "cancelled"))
        .filter(User.role == "customer")
        .group_by(User.id)
        .order_by(desc("total_spent"))
        .all()
    )
    return [
        {
            "id": customer.id,
            "email": customer.email,
            "name": f"{customer.first_name} {customer.last_name}",
            "joined_at": customer.created_at,
            "order_count": customer.total_orders,
            "ltv": customer.total_spent or 0,
        }
        for customer in customers
    ]


@router.get("/customers/{user_id}", dependencies=[Depends(require_role(["admin"]))])
async def get_customer_details(user_id: int, db: Session = Depends(get_db)):
    user_stats = (
        db.query(
            User.id,
            User.email,
            User.first_name,
            User.last_name,
            User.created_at,
            func.count(Order.id).label("total_orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total_spent"),
        )
        .outerjoin(Order, and_(User.id == Order.user_id, Order.status != "cancelled"))
        .filter(User.id == user_id, User.role == "customer")
        .group_by(User.id)
        .first()
    )
    if not user_stats:
        raise HTTPException(status_code=404, detail="Customer not found")

    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return {
        "id": user_stats.id,
        "email": user_stats.email,
        "name": f"{user_stats.first_name} {user_stats.last_name}",
        "joined_at": user_stats.created_at,
        "order_count": user_stats.total_orders,
        "ltv": user_stats.total_spent or 0,
        "orders": [
            {
                "id": order.id,
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at,
            }
            for order in orders
        ],
    }


@router.post("/upload", dependencies=[Depends(require_role(["admin", "manager"]))])
async def upload_image(request: Request, file: UploadFile = File(...)):
    allowed_mime_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_mime_types:
        logger.warning("invalid_upload_attempt", content_type=file.content_type)
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WebP.")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Unsupported file extension. Use .jpg, .png, or .webp")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")

    safe_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    base_url = str(request.base_url).rstrip("/")
    return {"url": f"{base_url}/uploads/{safe_filename}"}


@router.get("/inventory/alerts", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_inventory_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(Product, Variant, InventoryItem)
        .join(Variant, Variant.product_id == Product.id)
        .join(InventoryItem, InventoryItem.variant_id == Variant.id)
        .filter(InventoryItem.track_inventory == 1, InventoryItem.available_quantity <= InventoryItem.reorder_threshold)
        .order_by(InventoryItem.available_quantity.asc(), Product.id.asc())
        .all()
    )
    return {
        "count": len(alerts),
        "items": [
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "variant_id": variant.id,
                "variant_title": variant.title,
                "sku": variant.sku,
                "stock": inventory_item.available_quantity,
                "reorder_threshold": inventory_item.reorder_threshold,
            }
            for product, variant, inventory_item in alerts
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/inventory/dispatch-alert", dependencies=[Depends(require_role(["admin", "manager"]))])
async def dispatch_inventory_alert(db: Session = Depends(get_db)):
    items = db.query(Product).filter(Product.stock < 10).all()
    return {
        "status": "success",
        "message": f"Alert dispatched for {len(items)} items",
        "recipients": ["procurement@cozhaven.com"],
    }


@router.get("/promotions", dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_promotions(db: Session = Depends(get_db)):
    promos = db.query(PromoCode).order_by(PromoCode.created_at.desc(), PromoCode.id.desc()).all()
    return [_serialize_promo_code(promo) for promo in promos]


@router.post("/promotions", dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_promotion(
    payload: PromoCodeAdminInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "manager":
        approval_request = _create_approval_request(
            db,
            entity_type="promotion",
            entity_id=None,
            action="promotion.created",
            summary=f"Create promo code {payload.code.upper().strip()}",
            payload=payload.model_dump(),
            current_user=current_user,
        )
        db.commit()
        user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
        return {
            "status": "pending_approval",
            "message": "Promotion submitted for admin approval",
            "approval_request": _serialize_approval_request(approval_request, user_names),
        }

    promo, action = _apply_promotion_payload(db, payload)
    _log_admin_event(
        db,
        action=action,
        entity_type="promotion",
        entity_id=promo.id,
        entity_label=promo.code,
        summary=f"Created promo code {promo.code}",
        current_user=current_user,
        metadata={
            "type": promo.type,
            "value": float(promo.value),
            "is_active": bool(promo.is_active),
            "expires_at": promo.expires_at.isoformat() if promo.expires_at else None,
        },
    )
    db.commit()
    db.refresh(promo)
    return _serialize_promo_code(promo)


@router.put("/promotions/{promo_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_promotion(
    promo_id: int,
    payload: PromoCodeAdminInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "manager":
        approval_request = _create_approval_request(
            db,
            entity_type="promotion",
            entity_id=promo_id,
            action="promotion.updated",
            summary=f"Update promo code {payload.code.upper().strip()}",
            payload=payload.model_dump(),
            current_user=current_user,
        )
        db.commit()
        user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
        return {
            "status": "pending_approval",
            "message": "Promotion update submitted for admin approval",
            "approval_request": _serialize_approval_request(approval_request, user_names),
        }

    promo, action = _apply_promotion_payload(db, payload, promo_id)
    _log_admin_event(
        db,
        action=action,
        entity_type="promotion",
        entity_id=promo.id,
        entity_label=promo.code,
        summary=f"Updated promo code {promo.code}",
        current_user=current_user,
        metadata={
            "type": promo.type,
            "value": float(promo.value),
            "is_active": bool(promo.is_active),
            "expires_at": promo.expires_at.isoformat() if promo.expires_at else None,
        },
    )
    db.commit()
    db.refresh(promo)
    return _serialize_promo_code(promo)


@router.delete("/promotions/{promo_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_promotion(
    promo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo code not found")

    if current_user.role == "manager":
        approval_request = _create_approval_request(
            db,
            entity_type="promotion",
            entity_id=promo.id,
            action="promotion.deleted",
            summary=f"Delete promo code {promo.code}",
            payload={"promo_id": promo.id, "code": promo.code},
            current_user=current_user,
        )
        db.commit()
        user_names = {current_user.id: f"{current_user.first_name} {current_user.last_name}".strip() or current_user.email}
        return {
            "status": "pending_approval",
            "message": "Promotion deletion submitted for admin approval",
            "approval_request": _serialize_approval_request(approval_request, user_names),
        }

    _log_admin_event(
        db,
        action="promotion.deleted",
        entity_type="promotion",
        entity_id=promo.id,
        entity_label=promo.code,
        summary=f"Deleted promo code {promo.code}",
        current_user=current_user,
        metadata={
            "type": promo.type,
            "value": float(promo.value),
            "is_active": bool(promo.is_active),
        },
    )
    db.delete(promo)
    db.commit()
    return {"message": "Promo code deleted"}


@router.get("/users", dependencies=[Depends(require_role(["admin"]))])
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "created_at": user.created_at,
        }
        for user in users
    ]


@router.patch("/users/{user_id}/role", dependencies=[Depends(require_role(["admin"]))])
async def update_user_role(user_id: int, role_update: UserRoleUpdate, request: Request, db: Session = Depends(get_db)):
    valid_roles = {"admin", "manager", "viewer", "customer"}
    if role_update.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_user = request.state.user if hasattr(request.state, "user") else None
    if current_user and current_user.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")

    old_role = user.role
    user.role = role_update.role
    db.commit()
    logger.info("user_role_updated", user_id=user_id, old_role=old_role, new_role=role_update.role)
    return {"message": f"Role updated from {old_role} to {role_update.role}"}


@router.post("/catalog/import", dependencies=[Depends(require_role(["admin"]))])
async def import_catalog(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    contents = await file.read()
    temp_filename = f"catalog_import_{uuid.uuid4().hex}.csv"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    with open(temp_path, "wb") as f:
        f.write(contents)

    job = BackgroundJob(
        job_type="catalog_import",
        status="pending",
        performed_by=current_user.id,
        file_path=temp_path,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(_run_catalog_import, job.id)
    return {"id": job.id, "status": "pending", "message": "Import job started"}


async def _run_catalog_import(job_id: int):
    from database import SessionLocal
    import csv
    import os
    from datetime import datetime, timezone

    db = SessionLocal()
    job = db.query(BackgroundJob).filter(BackgroundJob.id == job_id).first()
    if not job:
        return

    try:
        job.status = "processing"
        job.progress = 5
        db.commit()

        if not os.path.exists(job.file_path):
            raise Exception("Import file not found")

        with open(job.file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if not rows:
            raise Exception("CSV file is empty")

        total = len(rows)
        processed = 0
        errors = []

        for i, row in enumerate(rows):
            try:
                # Basic Upsert Logic
                name = row.get("Name")
                if not name:
                    continue

                slug = row.get("Slug") or name.lower().replace(" ", "-")
                product = db.query(Product).filter(Product.slug == slug).first()
                
                if not product:
                    product = Product(
                        name=name,
                        slug=slug,
                        category=row.get("Category", "Uncategorized"),
                        price=float(row.get("Price", 0)),
                        original_price=float(row.get("Compare At Price")) if row.get("Compare At Price") else None,
                        stock=int(row.get("Stock", 0)),
                        status=row.get("Status", "active")
                    )
                    db.add(product)
                else:
                    product.name = name
                    product.category = row.get("Category", product.category)
                    product.price = float(row.get("Price", product.price))
                    product.stock = int(row.get("Stock", product.stock))
                    product.status = row.get("Status", product.status)

                processed += 1
                if processed % 5 == 0:
                    job.progress = 5 + int((processed / total) * 90)
                    db.commit()

            except Exception as e:
                errors.append(f"Row {i+1}: {str(e)}")

        db.commit()
        job.status = "completed"
        job.progress = 100
        job.result_json = f'{{"processed": {processed}, "total": {total}, "errors": {len(errors)}}}'
        job.message = f"Imported {processed}/{total} items."
        if errors:
            job.message += f" {len(errors)} errors encountered."
        
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        job.status = "failed"
        job.message = str(e)
        db.commit()

# ─────────────────────────────────────────────────────────────────────────
# MERCHANDISING (Phase 4)
# ─────────────────────────────────────────────────────────────────────────

from schemas import (
    PriceListBase, PriceListResponse, 
    PromotionCampaignBase, PromotionCampaignResponse,
    CustomerSegmentBase, CustomerSegmentResponse,
    PriceListEntryBase
)
from models import (
    PriceList, PriceListEntry, CustomerSegment,
    PromotionCampaign, DiscountRule
)

@router.get("/merchandising/price-lists", response_model=List[PriceListResponse], dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_price_lists(db: Session = Depends(get_db)):
    price_lists = db.query(PriceList).all()
    # Add count for response
    for pl in price_lists:
        pl.entries_count = db.query(PriceListEntry).filter(PriceListEntry.price_list_id == pl.id).count()
    return price_lists

@router.post("/merchandising/price-lists", response_model=PriceListResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_price_list(payload: PriceListBase, db: Session = Depends(get_db)):
    pl = PriceList(**payload.model_dump())
    db.add(pl)
    db.commit()
    db.refresh(pl)
    pl.entries_count = 0
    return pl

@router.get("/merchandising/campaigns", response_model=List[PromotionCampaignResponse], dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_campaigns(db: Session = Depends(get_db)):
    return db.query(PromotionCampaign).all()

@router.post("/merchandising/campaigns", response_model=PromotionCampaignResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_campaign(payload: PromotionCampaignBase, db: Session = Depends(get_db)):
    campaign = PromotionCampaign(**payload.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.get("/merchandising/segments", response_model=List[CustomerSegmentResponse], dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_segments(db: Session = Depends(get_db)):
    return db.query(CustomerSegment).all()

@router.post("/merchandising/segments", response_model=CustomerSegmentResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_segment(payload: CustomerSegmentBase, db: Session = Depends(get_db)):
    segment = CustomerSegment(**payload.model_dump())
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return segment

# Price List Entries (Bulk Update for a list)
@router.post("/merchandising/price-lists/{list_id}/entries", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_price_list_entries(list_id: int, entries: List[PriceListEntryBase], db: Session = Depends(get_db)):
    # Simple strategy: clear and redraw for the provided ones
    for entry in entries:
        existing = db.query(PriceListEntry).filter(
            PriceListEntry.price_list_id == list_id,
            PriceListEntry.variant_id == entry.variant_id
        ).first()
        if existing:
            existing.price = entry.price
            existing.compare_at_price = entry.compare_at_price
        else:
            db.add(PriceListEntry(
                price_list_id=list_id,
                variant_id=entry.variant_id,
                price=entry.price,
                compare_at_price=entry.compare_at_price
            ))
    db.commit()
    return {"message": f"Updated {len(entries)} entries in price list {list_id}"}


@router.get("/jobs", response_model=PaginatedBackgroundJobs, dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_background_jobs(page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
    page = max(page, 1)
    limit = min(max(limit, 1), 100)
    query = db.query(BackgroundJob).order_by(BackgroundJob.created_at.desc())
    total = query.count()
    jobs = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [
            {
                "id": job.id,
                "job_type": job.job_type,
                "status": job.status,
                "progress": job.progress,
                "message": job.message,
                "file_path": job.file_path,
                "created_at": job.created_at,
                "completed_at": job.completed_at,
            }
            for job in jobs
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if total else 0,
    }


@router.post("/catalog/export", dependencies=[Depends(require_role(["admin"]))])
async def export_catalog(
    background_tasks: BackgroundTasks,
    filters: BulkActionFilters = Depends(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = BackgroundJob(
        job_type="catalog_export",
        status="pending",
        performed_by=current_user.id,
        payload_json=filters.model_dump_json(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(_run_catalog_export, job.id, filters)
    return {"id": job.id, "status": "pending", "message": "Export job started"}


async def _run_catalog_export(job_id: int, filters: BulkActionFilters):
    # This will be fully implemented in a following step
    # but the infrastructure is now in place
    from database import SessionLocal
    import csv
    import os
    from datetime import datetime, timezone

    db = SessionLocal()
    job = db.query(BackgroundJob).filter(BackgroundJob.id == job_id).first()
    if not job:
        return

    try:
        job.status = "processing"
        job.progress = 10
        db.commit()

        # Build query based on filters
        query = _admin_product_query(db)
        if filters.q:
            search = f"%{filters.q.strip().lower()}%"
            query = query.filter(Product.name.ilike(search) | Product.category.ilike(search) | Product.slug.ilike(search))
        if filters.category and filters.category != "all":
            query = query.filter(Product.category == filters.category)
        if filters.brand and filters.brand != "all":
            query = query.filter(Product.brand == filters.brand)
        if filters.min_price is not None:
            query = query.filter(Product.price >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Product.price <= filters.max_price)

        products = query.all()
        job.progress = 30
        db.commit()

        filename = f"catalog_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join("uploads", filename)
        os.makedirs("uploads", exist_ok=True)

        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Name", "Slug", "SKU", "Category", "Price", "Compare At Price", "Stock", "Status"])
            for i, p in enumerate(products):
                variant = _default_variant(p)
                writer.writerow([
                    p.id,
                    p.name,
                    p.slug,
                    variant.sku if variant else "",
                    p.category,
                    p.price,
                    p.original_price,
                    p.stock,
                    p.status
                ])
                if i % 10 == 0:
                    job.progress = 30 + int((i / len(products)) * 60)
                    db.commit()

        job.status = "completed"
        job.progress = 100
        job.file_path = f"/uploads/{filename}"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        job.status = "failed"
        job.message = str(e)
        db.commit()
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────
# TRANSLATIONS (Phase 5)
# ─────────────────────────────────────────────────────────────────────────

from schemas import (
    ProductTranslationBase, PageTranslationBase, BlogTranslationBase
)
from models import (
    ProductTranslation, PageTranslation, BlogTranslation
)

@router.get("/translations/product/{product_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_product_translations(product_id: int, db: Session = Depends(get_db)):
    return db.query(ProductTranslation).filter(ProductTranslation.product_id == product_id).all()

@router.post("/translations/product", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_product_translation(payload: ProductTranslationBase, db: Session = Depends(get_db)):
    existing = db.query(ProductTranslation).filter(
        ProductTranslation.product_id == payload.product_id,
        ProductTranslation.locale == payload.locale
    ).first()
    
    if existing:
        for field, value in payload.model_dump(exclude={"product_id", "locale"}).items():
            if value is not None:
                setattr(existing, field, value)
    else:
        db.add(ProductTranslation(**payload.model_dump()))
    
    db.commit()
    return {"message": "Translation updated"}

@router.get("/translations/page/{page_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_page_translations(page_id: int, db: Session = Depends(get_db)):
    return db.query(PageTranslation).filter(PageTranslation.page_id == page_id).all()

@router.post("/translations/page", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_page_translation(payload: PageTranslationBase, db: Session = Depends(get_db)):
    existing = db.query(PageTranslation).filter(
        PageTranslation.page_id == payload.page_id,
        PageTranslation.locale == payload.locale
    ).first()
    
    if existing:
        for field, value in payload.model_dump(exclude={"page_id", "locale"}).items():
            if value is not None:
                setattr(existing, field, value)
    else:
        db.add(PageTranslation(**payload.model_dump()))
        
    db.commit()
    return {"message": "Translation updated"}

@router.get("/translations/blog/{post_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def get_blog_translations(post_id: int, db: Session = Depends(get_db)):
    return db.query(BlogTranslation).filter(BlogTranslation.post_id == post_id).all()

@router.post("/translations/blog", dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_blog_translation(payload: BlogTranslationBase, db: Session = Depends(get_db)):
    existing = db.query(BlogTranslation).filter(
        BlogTranslation.post_id == payload.post_id,
        BlogTranslation.locale == payload.locale
    ).first()
    
    if existing:
        for field, value in payload.model_dump(exclude={"post_id", "locale"}).items():
            if value is not None:
                setattr(existing, field, value)
    else:
        db.add(BlogTranslation(**payload.model_dump()))
        
    db.commit()
    return {"message": "Translation updated"}
