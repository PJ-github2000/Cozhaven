from typing import Optional, Any
from sqlalchemy.orm import Session
from models import ProductTranslation, PageTranslation, BlogTranslation

def localize_product(db: Session, product_data: dict, locale: Optional[str]) -> dict:
    if not locale or locale.lower() == "en":
        return product_data
    
    translation = db.query(ProductTranslation).filter(
        ProductTranslation.product_id == product_data["id"],
        ProductTranslation.locale == locale
    ).first()
    
    if translation:
        if translation.name: product_data["name"] = translation.name
        if translation.description: product_data["description"] = translation.description
        if translation.slug: product_data["slug"] = translation.slug
        
    return product_data

def localize_page(db: Session, page_data: dict, locale: Optional[str]) -> dict:
    if not locale or locale.lower() == "en":
        return page_data
    
    translation = db.query(PageTranslation).filter(
        PageTranslation.page_id == page_data["id"],
        PageTranslation.locale == locale
    ).first()
    
    if translation:
        if translation.title: page_data["title"] = translation.title
        if translation.slug: page_data["slug"] = translation.slug
        if translation.content_json: page_data["content_json"] = translation.content_json
        
    return page_data

def localize_blog_post(db: Session, post_data: dict, locale: Optional[str]) -> dict:
    if not locale or locale.lower() == "en":
        return post_data
    
    translation = db.query(BlogTranslation).filter(
        BlogTranslation.post_id == post_data["id"],
        BlogTranslation.locale == locale
    ).first()
    
    if translation:
        if translation.title: post_data["title"] = translation.title
        if translation.slug: post_data["slug"] = translation.slug
        if translation.excerpt: post_data["excerpt"] = translation.excerpt
        if translation.body: post_data["body"] = translation.body
        
    return post_data
