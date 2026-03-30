from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

from utils import collection_to_dict

router = APIRouter(prefix="/api/collections", tags=["collections"])

@router.get("", response_model=List[schemas.CollectionBrief])
def get_collections(featured_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(models.Collection)
    if featured_only:
        query = query.filter(models.Collection.is_featured == 1)
    collections = query.all()
    return [collection_to_dict(c, include_products=False) for c in collections]

@router.get("/{slug}", response_model=schemas.Collection)
def get_collection(slug: str, db: Session = Depends(get_db)):
    collection = db.query(models.Collection).filter(models.Collection.slug == slug).first()
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    return collection_to_dict(collection)
