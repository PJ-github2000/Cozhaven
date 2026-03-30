"""
Cozhaven — Checkout & Stripe Routes
Payment intent creation, checkout calculation, promo validation, webhooks, order confirmation.
"""
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
import stripe

from config import STRIPE_WEBHOOK_SECRET, CANADIAN_TAX_RATES, SHIPPING_RATES
from auth import get_current_user
from database import get_db
from models import Product, Order, OrderItem, User, PromoCode
from schemas import CheckoutItem, CheckoutRequest, PromoCodeRequest
from logger import get_logger
from services.email_service import email_service
from utils import product_effective_pricing

logger = get_logger("checkout")

router = APIRouter(prefix="/api", tags=["checkout"])


def _calculate_order_total(items: List[CheckoutItem], shipping_method: str, province: str, promo_code: Optional[str], db: Session):
    """Server-side total calculation using ORM."""
    subtotal = 0.0
    line_items = []

    # Fetch products one by one to ensure up-to-date stock and handle individual product not found
    for item in items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")

        # Capture values into local variables to avoid repeated access or issues with large fields
        prod_stock = int(product.stock)
        prod_price = float(product_effective_pricing(product)["price"])
        prod_name = str(product.name)

        if prod_stock < int(item.quantity):
            raise HTTPException(
                status_code=400,
                detail=f"'{prod_name}' only has {prod_stock} in stock (requested {item.quantity})"
            )
            
        line_total = prod_price * int(item.quantity)
        subtotal += line_total
        line_items.append({
            "product_id": product.id,
            "name": prod_name,
            "price": prod_price,
            "quantity": int(item.quantity),
            "line_total": line_total,
        })

    # Apply promo code discount
    discount = 0.0
    promo_code_upper = promo_code.upper().strip() if promo_code else None
    now = datetime.now(timezone.utc)

    if promo_code_upper:
        promo = db.query(PromoCode).filter(PromoCode.code == promo_code_upper, PromoCode.is_active == 1).first()
        if promo:
            expires_at = promo.expires_at.replace(tzinfo=timezone.utc) if promo.expires_at and promo.expires_at.tzinfo is None else promo.expires_at
            if expires_at and expires_at < now:
                promo = None
            elif promo.type == "percent":
                discount = subtotal * (float(promo.value) / 100.0)
            elif promo.type == "fixed":
                discount = min(float(promo.value), subtotal)

    discounted_subtotal = subtotal - discount

    # Shipping
    shipping_cost = float(SHIPPING_RATES.get(shipping_method, 0))
    if promo_code_upper == "FREESHIP":
        shipping_cost = 0.0

    # Tax
    tax_info = CANADIAN_TAX_RATES.get(province, {"label": "GST", "rate": 0.05})
    tax_rate = float(tax_info["rate"])
    tax_amount = float(round(float(discounted_subtotal * tax_rate), 2))

    total = float(round(float(discounted_subtotal + shipping_cost + tax_amount), 2))

    return {
        "subtotal": round(float(subtotal), 2),
        "discount": round(float(discount), 2),
        "shipping": float(shipping_cost),
        "tax_label": str(tax_info["label"]),
        "tax_rate": tax_rate,
        "tax_amount": float(tax_amount),
        "total": float(total),
        "line_items": line_items,
    }


@router.post("/checkout/calculate")
async def calculate_checkout(request: CheckoutRequest, db: Session = Depends(get_db)):
    """Preview the final total before payment."""
    try:
        result = _calculate_order_total(
            request.items, request.shipping_method, request.province, request.promo_code, db
        )
        return result
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate-promo")
async def validate_promo(request: PromoCodeRequest, db: Session = Depends(get_db)):
    """Server-side promo code validation using database."""
    code = request.code.upper().strip()
    promo = db.query(PromoCode).filter(PromoCode.code == code, PromoCode.is_active == 1).first()
    
    if not promo:
        raise HTTPException(status_code=400, detail="Invalid or expired promo code")

    expires_at = promo.expires_at.replace(tzinfo=timezone.utc) if promo.expires_at and promo.expires_at.tzinfo is None else promo.expires_at
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired promo code")

    discount = 0.0
    promo_val = float(promo.value)
    if promo.type == "percent":
        discount = float(request.subtotal) * (promo_val / 100.0)
    elif promo.type == "fixed":
        discount = min(promo_val, float(request.subtotal))

    return {
        "valid": True,
        "code": code,
        "label": f"{promo_val}% Off" if promo.type == 'percent' else f"${promo_val} Off",
        "type": promo.type,
        "value": promo_val,
        "discount_amount": round(float(discount), 2),
    }


@router.post("/create-payment-intent")
async def create_payment_intent(request: CheckoutRequest, db: Session = Depends(get_db)):
    """Create a Stripe PaymentIntent with server-side calculated total."""
    try:
        calculation = _calculate_order_total(
            request.items, request.shipping_method, request.province, request.promo_code, db
        )

        items_for_stripe = [{"pid": i.product_id, "qty": i.quantity, "color": i.color, "size": i.size} for i in request.items]

        idempotency_data = {
            "items": [{"pid": i.product_id, "qty": i.quantity} for i in request.items],
            "shipping_method": request.shipping_method,
            "province": request.province,
            "promo_code": request.promo_code,
            "email": request.email,
            "shipping_address": request.shipping_address,
            "total": calculation["total"]
        }

        request_hash = hashlib.sha256(
            json.dumps(idempotency_data, sort_keys=True).encode()
        ).hexdigest()[:24]

        total_val = calculation.get("total", 0.0)
        total_in_cents = int(float(total_val) * 100)
        idempotency_key = f"pi_{request_hash}"

        intent = stripe.PaymentIntent.create(
            amount=total_in_cents,
            currency="cad",
            automatic_payment_methods={"enabled": True},
            metadata={
                "cozhaven_items": json.dumps(items_for_stripe),
                "shipping_method": request.shipping_method,
                "province": request.province,
                "promo_code": request.promo_code or "",
                "subtotal": str(calculation["subtotal"]),
                "tax": str(calculation["tax_amount"]),
                "shipping_cost": str(calculation["shipping"]),
                "discount": str(calculation["discount"]),
                "email": request.email or "",
                "shipping_address": json.dumps(request.shipping_address) if isinstance(request.shipping_address, (dict, list)) else (request.shipping_address or ""),
            },
            receipt_email=request.email if request.email else None,
            description=f"Cozhaven Order — {len(request.items)} item(s)",
            idempotency_key=idempotency_key,
        )

        return {
            "clientSecret": intent["client_secret"],
            "paymentIntentId": intent["id"],
            "calculation": calculation,
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Stripe Webhook — One central place for final order creation and stock deduction.
    Must respond with 200 early to prevent Stripe retries.
    """
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")
    
    # ─── Verification Required for Production (C04) ───
    if not STRIPE_WEBHOOK_SECRET:
        logger.error("webhook_config_error", detail="STRIPE_WEBHOOK_SECRET not set. Webhooks will fail.")
        # We fail hard here in production to prevent processing unverified payments.
        raise HTTPException(status_code=500, detail="Webhook configuration missing")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.warning("webhook_invalid_signature", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event.get("type", "")

    if event_type == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        metadata = payment_intent.get("metadata", {})

        try:
            # ─── Idempotency Check (H11) ───
            existing_order = db.query(Order).filter(Order.payment_method == f"stripe:{payment_intent['id']}").first()
            if existing_order:
                logger.info("webhook_duplicate_ignore", stripe_id=payment_intent['id'])
                return {"status": "ignored", "reason": "already_processed"}

            items_json = json.loads(metadata.get("cozhaven_items", "[]"))
            shipping_address = metadata.get("shipping_address", "")
            email = metadata.get("email", "")
            # Recover name from metadata or intent (Staff fix: C09)
            guest_name = metadata.get("full_name") or payment_intent.get("shipping", {}).get("name") or "Guest"

            # Look up user
            user = db.query(User).filter(User.email == email).first()
            user_id = user.id if user else None

            total_amount = payment_intent["amount"] / 100.0

            # Create Order
            new_order = Order(
                user_id=user_id,
                guest_email=email,
                guest_name=guest_name,
                total_amount=total_amount,
                status="paid",
                shipping_address=shipping_address,
                payment_method=f"stripe:{payment_intent['id']}"
            )
            db.add(new_order)
            db.flush() # Flush to get the new_order.id

            email_items = []
            for item in items_json:
                # Row-level lock to prevent race conditions during concurrent webhook processing
                product = db.query(Product).filter(Product.id == item["pid"]).with_for_update().first()
                if product:
                    # Create OrderItem
                    order_item = OrderItem(
                        order_id=new_order.id,
                        product_id=item["pid"],
                        quantity=item["qty"],
                        price=product.price,
                        color=item.get("color"),
                        size=item.get("size")
                    )
                    db.add(order_item)
                    # Inventory Management (C06/H02)
                    # Atomic integer subtraction in DB
                    product.stock -= item["qty"]
                    email_items.append({"name": product.name, "qty": item["qty"], "price": float(product.price)})

            db.commit()
            logger.info("order_placed_success", order_id=new_order.id, email=email)
            
            # --- Staff Notification Point (H10) ---
            background_tasks.add_task(
                email_service.send_order_confirmation,
                email=email,
                order_id=new_order.id,
                total=float(total_amount),
                items=email_items
            )
            
            return {"status": "success", "order_id": new_order.id}
        except Exception as e:
            print(f"Error processing webhook event: {e}")
            db.rollback() # Rollback in case of error

    return {"status": "ok"}


@router.post("/orders/confirm")
async def confirm_order_frontend(
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Called by frontend after Stripe payment succeeds — creates order as backup to webhook."""
    body = await request.json()
    payment_intent_id = body.get("paymentIntentId")
    shipping_info = body.get("shipping", {})
    items = body.get("items", [])

    if not payment_intent_id:
        raise HTTPException(status_code=400, detail="paymentIntentId is required")

    try:
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
        if pi.status != "succeeded":
            raise HTTPException(status_code=400, detail=f"Payment not confirmed. Status: {pi.status}")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check if order already created by webhook
    existing = db.query(Order).filter(Order.payment_method == f"stripe:{payment_intent_id}").first()
    if existing:
        return {"order_id": existing.id, "status": "already_created", "total": pi.amount / 100.0}

    total_amount = pi.amount / 100.0
    address_str = json.dumps(shipping_info) if shipping_info else ""

    new_order = Order(
        user_id=user.id,
        total_amount=total_amount,
        status="paid",
        shipping_address=address_str,
        payment_method=f"stripe:{payment_intent_id}"
    )
    db.add(new_order)
    db.flush() # Flush to get the new_order.id

    for item in items:
        pid = item.get("product_id") or item.get("id")
        # Row-level lock for the frontend confirmation backup flow
        product = db.query(Product).filter(Product.id == pid).with_for_update().first()
        if product:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=pid,
                quantity=item.get("quantity", 1),
                price=product.price,
                color=item.get("color"),
                size=item.get("size")
            )
            db.add(order_item)
            product.stock -= item.get("quantity", 1)

    db.commit()
    return {"order_id": new_order.id, "status": "success", "total": total_amount}
