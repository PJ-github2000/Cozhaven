from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.orm import Session
from models import Variant, ScheduledPrice, PriceList, PriceListEntry, CustomerSegment, DiscountRule, PromotionCampaign, User

def get_active_price(db: Session, variant: Variant, user: Optional[User] = None) -> dict:
    """
    Resolve the active price for a given variant and user.
    Priority:
    1. Active ScheduledPrice (Sale)
    2. Highest priority PriceList assigned to user's segments
    3. Default variant price
    """
    now = datetime.now(timezone.utc)
    
    # 1. Check Scheduled Prices (Sales) - Highest Priority
    scheduled = db.query(ScheduledPrice).filter(
        ScheduledPrice.variant_id == variant.id,
        ScheduledPrice.is_active == 1,
        ScheduledPrice.starts_at <= now,
        (ScheduledPrice.ends_at == None) | (ScheduledPrice.ends_at >= now)
    ).order_by(ScheduledPrice.starts_at.desc()).first()

    if scheduled:
        return {
            "price": scheduled.price,
            "compare_at_price": scheduled.compare_at_price or variant.compare_at_price,
            "source": "scheduled_sale",
            "label": scheduled.label
        }

    # 2. Check Price Lists via Customer Segments
    if user:
        # Get active price lists assigned to user's segments
        # Note: This assumes a many-to-many relationship user <-> segment exists or is inferred
        # For simplicity in V1, let's assume segments are returned by a helper or user has a segments relationship
        # If user.role == 'vip', they might be in a VIP segment.
        
        # Placeholder for complex segmentation logic:
        segments = db.query(CustomerSegment).filter(CustomerSegment.price_lists.any()).all()
        # In a real app, you'd filter segments based on user.id or user.segments
        
        if segments:
            # Get entries from the highest priority active price list
            best_entry = db.query(PriceListEntry).join(PriceList).filter(
                PriceListEntry.variant_id == variant.id,
                PriceList.is_active == 1,
                PriceList.id.in_([pl.id for s in segments for pl in s.price_lists])
            ).order_by(PriceList.priority.desc()).first()

            if best_entry:
                return {
                    "price": best_entry.price,
                    "compare_at_price": best_entry.compare_at_price or variant.compare_at_price,
                    "source": f"price_list:{best_entry.price_list.name}",
                    "label": "Member Price"
                }

    # 3. Default Price
    return {
        "price": variant.price,
        "compare_at_price": variant.compare_at_price,
        "source": "default",
        "label": None
    }

def apply_promotions(db: Session, subtotal: Decimal, items: List[dict]) -> dict:
    """
    Apply active promotion campaigns and discount rules to the order.
    """
    now = datetime.now(timezone.utc)
    active_campaigns = db.query(PromotionCampaign).filter(
        PromotionCampaign.status == "active",
        PromotionCampaign.starts_at <= now,
        (PromotionCampaign.ends_at == None) | (PromotionCampaign.ends_at >= now)
    ).all()

    total_discount = Decimal("0.00")
    applied_rules = []

    for campaign in active_campaigns:
        for rule in campaign.discount_rules:
            if not rule.is_active:
                continue
            
            # check min order amount
            if rule.min_order_amount and subtotal < rule.min_order_amount:
                continue
            
            discount = Decimal("0.00")
            if rule.discount_type == "percentage":
                discount = (subtotal * rule.value) / 100
            elif rule.discount_type == "fixed":
                discount = rule.value
            
            # Simple V1: one rule per campaign
            total_discount += discount
            applied_rules.append({
                "campaign": campaign.name,
                "rule": rule.name,
                "amount": float(discount)
            })

    return {
        "total_discount": total_discount,
        "applied_rules": applied_rules
    }
