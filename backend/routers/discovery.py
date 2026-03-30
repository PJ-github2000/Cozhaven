from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone

from database import get_db
from models import Product, UserRecentView, RelatedProduct, User
from auth import get_current_user_optional
from utils import product_to_dict

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.get("/recommendations/{product_id}")
async def get_recommendations(product_id: int, limit: int = 4, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    # 1. Check for manual related products
    manual_related = (
        db.query(RelatedProduct)
        .filter(RelatedProduct.product_id == product_id)
        .order_by(RelatedProduct.position.asc())
        .limit(limit)
        .all()
    )
    
    if manual_related:
        products = [r.related for r in manual_related]
        return [product_to_dict(p, db=db, user=current_user) for p in products]

    # 2. Fallback: Rule-based (Same category, different product)
    source_product = db.query(Product).filter(Product.id == product_id).first()
    if not source_product:
        return []

    fallback_products = (
        db.query(Product)
        .filter(Product.category == source_product.category, Product.id != product_id, Product.status == "active")
        .order_by(Product.rating.desc())
        .limit(limit)
        .all()
    )
    
    return [product_to_dict(p, db=db, user=current_user) for p in fallback_products]

@router.get("/trending")
async def get_trending_products(limit: int = 8, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user_optional)):
    # Trending logic: High rating + recently updated or featured
    trending = (
        db.query(Product)
        .filter(Product.status == "active")
        .order_by(Product.is_featured.desc(), Product.rating.desc(), Product.updated_at.desc())
        .limit(limit)
        .all()
    )
    return [product_to_dict(p, db=db, user=current_user) for p in trending]

@router.get("/recent-views")
async def get_recent_views(limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    if not current_user:
        return []

    recent = (
        db.query(UserRecentView)
        .filter(UserRecentView.user_id == current_user.id)
        .order_by(UserRecentView.viewed_at.desc())
        .limit(limit)
        .all()
    )
    
    # Extract unique products
    product_ids = [rv.product_id for rv in recent]
    if not product_ids:
        return []
        
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    # Sort by recent view date
    product_map = {p.id: p for p in products}
    sorted_products = [product_map[pid] for pid in product_ids if pid in product_map]
    
    return [product_to_dict(p, db=db, user=current_user) for p in sorted_products]

@router.post("/record-view/{product_id}")
async def record_product_view(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    if not current_user:
        return {"status": "guest"}
        
    # Check if exists
    existing = db.query(UserRecentView).filter(
        UserRecentView.user_id == current_user.id,
        UserRecentView.product_id == product_id
    ).first()
    
    if existing:
        existing.viewed_at = datetime.now(timezone.utc)
    else:
        new_view = UserRecentView(user_id=current_user.id, product_id=product_id)
        db.add(new_view)
        
    db.commit()
    return {"status": "recorded"}
