
import json
from database import SessionLocal, init_db
from models import ContentBlock
from sqlalchemy import select

def seed_testimonials():
    # Ensure tables exist
    init_db()
    
    db = SessionLocal()
    try:
        # Check if block already exists
        existing = db.execute(select(ContentBlock).where(ContentBlock.name == "homepage-reviews")).scalar_one_or_none()
        
        testimonials = [
            {
                "id": 1,
                "name": "Sarah Jenkins",
                "product": "Lead Interior Designer, Studio Bloom",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                "text": "The architectural precision of Cozhaven's pieces transformed our entire penthouse project. Their commitment to Canadian-made quality is visible in every stitch and joint.",
                "rating": 5,
                "location": "Toronto, ON"
            },
            {
                "id": 2,
                "name": "Marcus Thorne",
                "product": "Architect",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
                "text": "Finding furniture that balances structural integrity with a minimalist aesthetic is rare. Cozhaven doesn't just make sofas; they create enduring centerpieces for modern living.",
                "rating": 5,
                "location": "Vancouver, BC"
            },
            {
                "id": 3,
                "name": "Elena Rodriguez",
                "product": "Premium Homeowner",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
                "text": "Our curved velvet sofa is the most complimented item in our home. It feels incredibly luxurious yet stands up perfectly to daily life. Exceptional service and design.",
                "rating": 5,
                "location": "Montreal, QC"
            }
        ]
        
        content_json = json.dumps(testimonials)
        
        if existing:
            existing.content_json = content_json
            print("Updated existing homepage-reviews block.")
        else:
            new_block = ContentBlock(
                name="homepage-reviews",
                block_type="testimonial_grid",
                content_json=content_json
            )
            db.add(new_block)
            print("Created new homepage-reviews block.")
            
        db.commit()
    except Exception as e:
        print(f"Error seeding testimonials: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_testimonials()
