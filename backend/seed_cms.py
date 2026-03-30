from datetime import datetime, timezone
import json
from utils import slugify
from database import SessionLocal
from models import BlogPost, ContentBlock, User
import sys
import os

blog_posts = [
    {
        "title": "5 Tips for Choosing the Perfect Sofa",
        "excerpt": "Your sofa is the centerpiece of your living room. Here's how to find the one that's perfect for your space, style, and lifestyle.",
        "image": "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Versatility-102-Inch-Velvet-Chaise-Sectionals-3-Seaters-Atunus-10.webp",
        "date": "2025-02-28",
        "readTime": "5 min",
        "category": "Living Room"
    },
    {
        "title": "Dining Room Trends for 2026",
        "excerpt": "From live-edge tables to mixed seating, discover the dining room trends that are defining modern entertaining.",
        "image": "https://atunus.com/wp-content/uploads/2025/06/53-Inch-Modern-Round-Dining-Table-1-1750239721.webp",
        "date": "2025-02-15",
        "readTime": "4 min",
        "category": "Dining"
    }
]

reviews = [
    { "name": "Jason Maxwell", "rating": 5, "text": "I have to admit, I was somewhat apprehensive about ordering furniture online, but Cozhaven exceeded every expectation. The quality is outstanding, delivery was right on schedule, and the customer service team was incredibly helpful throughout the entire process.", "product": "Designer Sectional" },
    { "name": "Eileen Heckel", "rating": 5, "text": "Love my new vanity!! Great price and quick delivery! The craftsmanship is impeccable and it looks even better in person than in the photos.", "product": "Designer Vanity" },
    { "name": "Rebecca Bolton", "rating": 5, "text": "Our experience in dealing with Cozhaven has been absolutely wonderful. The selection is curated perfectly and the quality speaks for itself.", "product": "Marble Dining Set" }
]

def main():
    db = SessionLocal()
    
    # 1. Seed Blog Posts
    print("Seeding missing blog posts...")
    admin_user = db.query(User).filter(User.role == "admin").first()
    admin_id = admin_user.id if admin_user else None

    for bp in blog_posts:
        slug = slugify(bp["title"])
        existing = db.query(BlogPost).filter(BlogPost.slug == slug).first()
        if not existing:
            post = BlogPost(
                title=bp["title"],
                slug=slug,
                excerpt=bp["excerpt"],
                featured_image=bp["image"],
                category=bp["category"],
                read_time=bp["readTime"],
                status="published",
                published_at=datetime.strptime(bp["date"], "%Y-%m-%d").replace(tzinfo=timezone.utc),
                author_id=admin_id
            )
            db.add(post)
    
    # 2. Seed Reviews Content Block
    print("Seeding reviews content block...")
    existing_reviews = db.query(ContentBlock).filter(ContentBlock.name == "homepage-reviews").first()
    if not existing_reviews:
        cb = ContentBlock(
            name="homepage-reviews",
            block_type="testimonial_list",
            content_json=json.dumps(reviews)
        )
        db.add(cb)
        
    db.commit()
    print("CMS seeding complete.")
    db.close()

if __name__ == "__main__":
    main()
