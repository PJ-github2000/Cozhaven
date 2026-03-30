"""
Cozhaven categories routes.
Public listing + admin CRUD for the normalized categories table.
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_role, get_current_user
from database import get_db
from models import Category, User
from schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from utils import slugify


router = APIRouter(tags=["categories"])


# ─── Public ───

@router.get("/api/categories", response_model=list[CategoryResponse])
async def get_categories(parent_id: int | None = None, db: Session = Depends(get_db)):
    """List categories. Optionally filter by parent_id for subcategories."""
    query = db.query(Category)
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
    else:
        query = query.filter(Category.parent_id.is_(None))
    return query.order_by(Category.position.asc(), Category.name.asc()).all()


@router.get("/api/categories/all", response_model=list[CategoryResponse])
async def get_all_categories(db: Session = Depends(get_db)):
    """List all categories (flat list for admin dropdowns)."""
    return db.query(Category).order_by(Category.position.asc(), Category.name.asc()).all()


@router.get("/api/categories/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ─── Admin ───

@router.post(
    "/api/admin/categories",
    response_model=CategoryResponse,
    dependencies=[Depends(require_role(["admin", "manager"]))],
)
async def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slug = slugify(payload.slug or payload.name)
    # Ensure unique slug
    base_slug = slug
    counter = 2
    while db.query(Category).filter(Category.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    if payload.parent_id is not None:
        parent = db.query(Category).filter(Category.id == payload.parent_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent category not found")

    category = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        image_url=payload.image_url,
        parent_id=payload.parent_id,
        position=payload.position,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put(
    "/api/admin/categories/{category_id}",
    response_model=CategoryResponse,
    dependencies=[Depends(require_role(["admin", "manager"]))],
)
async def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    updates = payload.model_dump(exclude_unset=True)

    if "slug" in updates or "name" in updates:
        desired_slug = slugify(updates.get("slug") or updates.get("name") or category.name)
        base_slug = desired_slug
        slug = desired_slug
        counter = 2
        while True:
            existing = db.query(Category).filter(Category.slug == slug, Category.id != category_id).first()
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        updates["slug"] = slug

    if "parent_id" in updates and updates["parent_id"] is not None:
        if updates["parent_id"] == category_id:
            raise HTTPException(status_code=400, detail="Category cannot be its own parent")
        parent = db.query(Category).filter(Category.id == updates["parent_id"]).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Parent category not found")

    for key, value in updates.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete(
    "/api/admin/categories/{category_id}",
    dependencies=[Depends(require_role(["admin"]))],
)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check for child categories
    children_count = db.query(Category).filter(Category.parent_id == category_id).count()
    if children_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete: category has {children_count} child categories. Delete or reassign them first.",
        )

    # Nullify category_id on products referencing this category
    from models import Product
    db.query(Product).filter(Product.category_id == category_id).update(
        {"category_id": None}, synchronize_session=False
    )

    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}
