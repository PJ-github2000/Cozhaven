"""
Cozhaven — Orders Router
CRUD operations for orders and order items.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Order, OrderItem, Product, User
from schemas import Order as OrderSchema

router = APIRouter(prefix="/api", tags=["orders"])

@router.post("/orders")
async def create_order(order_data: OrderSchema, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Create a new order. Validates stock and calculates total server-side.
    """
    # Batch fetch all products with row locking to avoid race conditions
    product_ids = [item.product_id for item in order_data.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    product_map = {p.id: p for p in products}

    total_amount = 0.0
    order_items_to_add = []

    for item in order_data.items:
        product = product_map.get(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} not found")
        
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock for '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
            )
        
        line_total = product.price * item.quantity
        total_amount += line_total
        
        # Decrement stock
        product.stock -= item.quantity
        
        order_items_to_add.append(OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
            color=item.color,
            size=item.size
        ))

    new_order = Order(
        user_id=user.id,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        payment_method=order_data.payment_method,
        status="pending",
        items=order_items_to_add
    )
    
    try:
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return {"order_id": new_order.id, "total": total_amount, "status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/orders")
async def get_my_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get all orders for the current user.
    """
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/orders/{order_id}")
async def get_order(order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get a specific order by ID, ensuring it belongs to the current user.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return order
