import os
import json
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Product, Collection, User
from passlib.context import CryptContext

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/cozhaven")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def infer_category(name):
    name = name.lower()
    if "living room set" in name or "sofa set" in name: return "Living Room Sets"
    if "dining set" in name: return "Dining Sets"
    if "bedroom set" in name or "bed set" in name: return "Bedroom Sets"
    if "sectional" in name: return "Sectionals"
    if "sofa bed" in name or "sofabed" in name or "futon" in name or "sleeper" in name: return "Sofa Beds"
    if "power recliner" in name or "recliner" in name: return "Recliners"
    if "loveseat" in name: return "Loveseats"
    if "sofa" in name or "couch" in name: return "Sofas"
    if "coffee table" in name: return "Coffee Tables"
    if "dining table" in name: return "Dining Tables"
    if "console table" in name or "accent table" in name or "end table" in name: return "Accent Tables"
    if "mattress" in name: return "Mattresses"
    if "bed" in name: return "Beds"
    if "vanity" in name or "dresser" in name: return "Bedroom Furniture"
    if "dining chair" in name: return "Dining Chairs"
    if "chair" in name or "lounger" in name or "stool" in name or "puffseat" in name: return "Chairs"
    if "mirror" in name: return "Mirrors"
    if "wall art" in name or "artwork" in name: return "Wall Art"
    if "tree" in name or "palm" in name or "plant" in name: return "Plants"
    if "bookshelf" in name or "storage" in name or "buffet" in name or "server" in name: return "Storage"
    return "General"

def seed_data():
    # 1. Seed Collections
    if db.query(Collection).count() == 0:
        print("Seeding collections...")
        collections = [
            Collection(name="Stanton Series", slug="stanton-series", description="The Stanton Series features premium Canadian-made sectional sofas designed for modular comfort and modern luxury.", image_url="https://candb.ca/cdn/shop/files/4223-km0513-stanton-sectional_7.jpg", is_featured=1),
            Collection(name="Modern Living", slug="modern-living", description="Clean lines and contemporary comfort for the modern home.", image_url="https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Adaptable-Comfort-Linen-Sofa-Sets-4-Seaters-Atunus-1.webp", is_featured=1),
        ]
        db.add_all(collections)
        db.commit()

    # 2. Seed Products from JSON
    if db.query(Product).count() < 10: # If DB is mostly empty
        json_path = "cozhaven_products.json"
        if os.path.exists(json_path):
            print(f"Seeding products from {json_path}...")
            with open(json_path, "r", encoding="utf-8") as f:
                products_data = json.load(f)
            
            for p_data in products_data:
                name = p_data.get("product_name")
                if not name or name.lower() == "sample": continue
                
                price_str = p_data.get("price", "0").replace(",", "")
                try: price = Decimal(price_str)
                except: price = Decimal("0")
                
                category = infer_category(name)
                image = p_data.get("image", "")

                if not db.query(Product).filter_by(name=name).first():
                    new_p = Product(
                        name=name, price=price, category=category, images=image,
                        description=f"A premium piece from our {category} collection.",
                        stock=50, status="active", is_canadian_made=1, rating=4.5, reviews=15
                    )
                    db.add(new_p)
            db.commit()

    # 3. Create Admin User
    admin_email = os.getenv("ADMIN_EMAIL", "admin@cozhaven.com")
    admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")
    
    if not db.query(User).filter_by(email=admin_email).first():
        print(f"Creating admin user: {admin_email}...")
        admin = User(
            email=admin_email,
            password_hash=pwd_context.hash(admin_pass),
            first_name="Store",
            last_name="Admin",
            role="admin"
        )
        db.add(admin)
        db.commit()

if __name__ == "__main__":
    try:
        seed_data()
        print("Seeding/Sync process complete.")
    except Exception as e:
        print(f"Seeding failed: {e}")
    finally:
        db.close()
