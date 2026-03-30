from database import SessionLocal
from models import Product
import json

from database import SessionLocal, engine
from models import Product, Base
import json

def seed():
    # Reset Tables
    print("Dropping and recreating all tables for schema sync...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        products = [
            {
                "name": "Elowen Mid-Century Sofa",
                "price": 1299.00,
                "original_price": 1599.00,
                "description": "A timeless silhouette featuring velvet upholstery and tapered walnut legs. Perfect for modern living rooms.",
                "category": "living-room",
                "subcategory": "Sofas",
                "stock": 15,
                "images": "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp,https://atunus.com/wp-content/uploads/2025/04/Bubble-Sectional-Sofa-Comfort-3D-Knitted-Loveseats-2-3-Seater-Atunus-1.webp",
                "colors": "#2A2622,#C9B8A8,#4A5568",
                "colorNames": "Charcoal Velvet,Sand Linen,Slate Grey",
                "sizes": "3-Seater,2-Seater,Chair",
                "materials": "Solid Oak,Performance Velvet,High-Density Foam",
                "configurations": "Standard,Chaise Left,Chaise Right",
                "is_canadian_made": 1,
                "badge": "new",
                "sale_percent": 15,
                "rating": 4.8,
                "reviews": 124,
                "specs": json.dumps({"Material": "Velvet", "Frame": "Kiln-dried Hardwood", "Legs": "Walnut", "Fill": "High-density Foam"}),
                "status": "active"
            },
            {
                "name": "Kallie Oak Dining Table",
                "price": 899.00,
                "original_price": 1100.00,
                "description": "Solid white oak table with a natural finish. Seats up to 6 comfortably.",
                "category": "dining",
                "subcategory": "Tables",
                "stock": 8,
                "images": "https://atunus.com/wp-content/uploads/2025/06/71-Inch-Modern-Dining-Table-1-1750239726.webp",
                "colors": "#E2E8F0,#CBD5E0",
                "colorNames": "Natural Oak,White Washed",
                "sizes": "6-Seater,4-Seater",
                "materials": "Solid White Oak,Natural Oil Finish",
                "configurations": "Standard,Extended",
                "is_canadian_made": 1,
                "badge": "sale",
                "sale_percent": 20,
                "rating": 4.6,
                "reviews": 89,
                "specs": json.dumps({"Material": "Solid White Oak", "Finish": "Natural Oil", "Length": "180cm", "Width": "90cm"}),
                "status": "active"
            },
            {
                "name": "Luna Arc Floor Lamp",
                "price": 249.00,
                "original_price": 299.00,
                "description": "Brushed brass floor lamp with an elegant marble base. Ideal for reading nooks.",
                "category": "lighting",
                "subcategory": "Floor Lamps",
                "stock": 25,
                "images": "https://atunus.com/wp-content/uploads/2025/06/6-Light-Rustic-Farmhouse-Chandelier-for-Dining-Room-1-1750236970.webp",
                "colors": "#FFD700,#000000",
                "colorNames": "Brushed Brass,Matte Black",
                "sizes": "Standard",
                "materials": "Brass Plated Steel,Carrara Marble Base",
                "configurations": "Fixed Arc",
                "is_canadian_made": 0,
                "badge": "popular",
                "sale_percent": None,
                "rating": 4.9,
                "reviews": 210,
                "specs": json.dumps({"Material": "Brass & Marble", "Socket": "E26", "Height": "180cm", "Cord": "2m"}),
                "status": "active"
            }
        ]

        for p_data in products:
            product = Product(**p_data)
            db.add(product)
        
        db.commit()
        print(f"Successfully sync-reseeded {len(products)} products with luxury variants.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
