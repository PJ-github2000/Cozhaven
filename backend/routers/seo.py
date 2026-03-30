from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Product, Page, BlogPost, Collection

from config import FRONTEND_URL
router = APIRouter(tags=["seo"])

@router.get("/sitemap.xml")
async def get_sitemap(db: Session = Depends(get_db)):
    """
    Dynamically generates a sitemap.xml for search engines.
    Includes Products, Categories, Collections, CMS Pages and Blog Posts.
    """
    base_url = FRONTEND_URL.rstrip('/')
    now = datetime.now().strftime("%Y-%m-%d")
    
    # 1. Base URLS
    urls = [
        {"loc": "/", "priority": "1.0"},
        {"loc": "/shop", "priority": "0.9"},
        {"loc": "/about", "priority": "0.7"},
        {"loc": "/blog", "priority": "0.7"},
        {"loc": "/contact", "priority": "0.6"},
    ]
    
    # 2. Dynamic Categories
    categories = db.query(Product.category).filter(Product.status == "active").distinct().all()
    for cat in categories:
        urls.append({"loc": f"/shop?category={cat[0]}", "priority": "0.8"})
        
    # 3. Dynamic Collections
    collections = db.query(Collection).all()
    for coll in collections:
        urls.append({"loc": f"/collections/{coll.slug}", "priority": "0.8"})
        
    # 4. Dynamic Products
    products = db.query(Product).filter(Product.status == "active").all()
    for p in products:
        urls.append({"loc": f"/products/{p.slug or p.id}", "priority": "0.9"})
        
    # 5. CMS Pages
    pages = db.query(Page).filter(Page.status == "published").all()
    for pg in pages:
        urls.append({"loc": f"/pages/{pg.slug}", "priority": "0.8"})
        
    # 6. Blog Posts
    posts = db.query(BlogPost).filter(BlogPost.status == "published").all()
    for post in posts:
        urls.append({"loc": f"/blog/{post.slug}", "priority": "0.7"})
        
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for item in urls:
        xml_content.append(f"  <url>")
        xml_content.append(f"    <loc>{base_url}{item['loc']}</loc>")
        xml_content.append(f"    <lastmod>{now}</lastmod>")
        xml_content.append(f"    <priority>{item['priority']}</priority>")
        xml_content.append(f"  </url>")
        
    xml_content.append("</urlset>")
    return Response(content="\n".join(xml_content), media_type="application/xml")
