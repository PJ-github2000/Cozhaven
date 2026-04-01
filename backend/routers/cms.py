from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import BlogPost, ContentBlock, Page, PageSection, SEOEntry, User
from schemas import (
    BlogPostBase,
    BlogPostResponse,
    ContentBlockBase,
    ContentBlockResponse,
    PageBase,
    PageResponse,
)
from auth import get_current_user, require_role
from localization import localize_page, localize_blog_post

router = APIRouter(prefix="/api/admin/cms", tags=["cms"])

# Helpers
def _serialize_seo(seo: Optional[SEOEntry]):
    if not seo:
        return None
    return {
        "id": seo.id,
        "meta_title": seo.meta_title,
        "meta_description": seo.meta_description,
        "canonical_url": seo.canonical_url,
        "robots_directive": seo.robots_directive,
    }

# PAGES
@router.get("/pages", response_model=List[PageResponse], dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_pages(db: Session = Depends(get_db)):
    pages = db.query(Page).order_by(Page.updated_at.desc()).all()
    return pages

@router.post("/pages", response_model=PageResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_page(payload: PageBase, db: Session = Depends(get_db)):
    page = Page(
        title=payload.title,
        slug=payload.slug,
        status=payload.status,
        template=payload.template,
        published_at=payload.published_at,
    )
    if payload.seo:
        seo = SEOEntry(**payload.seo.model_dump())
        db.add(seo)
        db.flush()
        page.seo_id = seo.id
    
    db.add(page)
    db.commit()
    db.refresh(page)
    return page

@router.get("/pages/{page_id}", response_model=PageResponse, dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.put("/pages/{page_id}", response_model=PageResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_page(page_id: int, payload: PageBase, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    
    page.title = payload.title
    page.slug = payload.slug
    page.status = payload.status
    page.template = payload.template
    page.published_at = payload.published_at

    if payload.seo:
        if not page.seo:
            seo = SEOEntry(**payload.seo.model_dump())
            db.add(seo)
            db.flush()
            page.seo_id = seo.id
        else:
            for key, value in payload.seo.model_dump().items():
                setattr(page.seo, key, value)
    
    db.commit()
    db.refresh(page)
    return page

@router.delete("/pages/{page_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.id == page_id).first()
    if page:
        db.delete(page)
        db.commit()
    return {"message": "Page deleted"}

# BLOG POSTS
@router.get("/blog", response_model=List[BlogPostResponse], dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_blog_posts(db: Session = Depends(get_db)):
    posts = db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()
    return posts

@router.post("/blog", response_model=BlogPostResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_blog_post(payload: BlogPostBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = BlogPost(
        title=payload.title,
        slug=payload.slug,
        excerpt=payload.excerpt,
        body=payload.body,
        featured_image=payload.featured_image,
        category=payload.category,
        read_time=payload.read_time,
        status=payload.status,
        published_at=payload.published_at,
        author_id=current_user.id
    )
    if payload.seo:
        seo = SEOEntry(**payload.seo.model_dump())
        db.add(seo)
        db.flush()
        post.seo_id = seo.id
    
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.get("/blog/{post_id}", response_model=BlogPostResponse, dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/blog/{post_id}", response_model=BlogPostResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_blog_post(post_id: int, payload: BlogPostBase, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.title = payload.title
    post.slug = payload.slug
    post.excerpt = payload.excerpt
    post.body = payload.body
    post.featured_image = payload.featured_image
    post.category = payload.category
    post.read_time = payload.read_time
    post.status = payload.status
    post.published_at = payload.published_at

    if payload.seo:
        if not post.seo:
            seo = SEOEntry(**payload.seo.model_dump())
            db.add(seo)
            db.flush()
            post.seo_id = seo.id
        else:
            for key, value in payload.seo.model_dump().items():
                setattr(post.seo, key, value)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/blog/{post_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if post:
        db.delete(post)
        db.commit()
    return {"message": "Blog post deleted"}

# CONTENT BLOCKS
@router.get("/blocks", response_model=List[ContentBlockResponse], dependencies=[Depends(require_role(["admin", "manager", "viewer"]))])
async def get_content_blocks(db: Session = Depends(get_db)):
    blocks = db.query(ContentBlock).order_by(ContentBlock.name.asc()).all()
    return blocks

@router.post("/blocks", response_model=ContentBlockResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def create_content_block(payload: ContentBlockBase, db: Session = Depends(get_db)):
    block = ContentBlock(**payload.model_dump())
    db.add(block)
    db.commit()
    db.refresh(block)
    return block

@router.put("/blocks/{block_id}", response_model=ContentBlockResponse, dependencies=[Depends(require_role(["admin", "manager"]))])
async def update_content_block(block_id: int, payload: ContentBlockBase, db: Session = Depends(get_db)):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    
    for key, value in payload.model_dump().items():
        setattr(block, key, value)
    
    db.commit()
    db.refresh(block)
    return block


@router.delete("/blocks/{block_id}", dependencies=[Depends(require_role(["admin", "manager"]))])
async def delete_content_block(block_id: int, db: Session = Depends(get_db)):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if block:
        db.delete(block)
        db.commit()
    return {"message": "Content block deleted"}


# ─────────────────────────────────────────────────────────────────────────
# STOREFRONT ENDPOINTS (PUBLIC)
# ─────────────────────────────────────────────────────────────────────────

from database import SessionLocal

public_router = APIRouter(prefix="/api/cms", tags=["cms-public"])

@public_router.get("/pages/{slug}", response_model=PageResponse)
async def get_public_page(slug: str, db: Session = Depends(get_db), locale: Optional[str] = None):
    # Check translations first
    from models import PageTranslation
    translated_page = db.query(PageTranslation).filter(PageTranslation.slug == slug, PageTranslation.locale == locale).first()
    
    if translated_page:
        # Resolve to original page ID but with translated slug
        page = db.query(Page).filter(Page.id == translated_page.page_id, Page.status == "published").first()
    else:
        page = db.query(Page).filter(Page.slug == slug, Page.status == "published").first()
        
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
        
    # Localize data
    data = PageResponse.model_validate(page).model_dump()
    return localize_page(db, data, locale)

@public_router.get("/blog", response_model=List[BlogPostResponse])
async def get_public_blog_posts(db: Session = Depends(get_db), locale: Optional[str] = None):
    posts = db.query(BlogPost).filter(BlogPost.status == "published").order_by(BlogPost.published_at.desc()).all()
    # Localize each
    result = []
    for p in posts:
        data = BlogPostResponse.model_validate(p).model_dump()
        result.append(localize_blog_post(db, data, locale))
    return result

@public_router.get("/blog/{slug}", response_model=BlogPostResponse)
async def get_public_blog_post(slug: str, db: Session = Depends(get_db), locale: Optional[str] = None):
    from models import BlogTranslation
    translated_post = db.query(BlogTranslation).filter(BlogTranslation.slug == slug, BlogTranslation.locale == locale).first()
    
    if translated_post:
        post = db.query(BlogPost).filter(BlogPost.id == translated_post.post_id, BlogPost.status == "published").first()
    else:
        post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.status == "published").first()
        
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    data = BlogPostResponse.model_validate(post).model_dump()
    return localize_blog_post(db, data, locale)
