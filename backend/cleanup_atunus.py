import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Product, ContentBlock, Page, BlogPost, SEOEntry

def cleanup():
    db = SessionLocal()
    try:
        # 1. Clean Products
        atunus_products = db.query(Product).filter(
            (Product.description.ilike("%atunus%")) | 
            (Product.name.ilike("%atunus%"))
        ).all()
        if atunus_products:
            print(f"Cleaning {len(atunus_products)} products mentioning Atunus...")
            for p in atunus_products:
                p.description = p.description.replace("Atunus Home", "Cozhaven").replace("Atunus", "Cozhaven")
                p.description = p.description.replace("atunus.com", "atunusfurniture.com")
                p.name = p.name.replace("Atunus Home", "Cozhaven").replace("Atunus", "Cozhaven")
        
        # 2. Clean CMS tables - Delete anything mentioning Atunus to be safe
        tables = [ContentBlock, Page, BlogPost, SEOEntry]
        for table in tables:
            rows = db.query(table).all()
            deleted = 0
            for row in rows:
                # Check all string columns
                is_atunus = False
                for column in row.__table__.columns:
                    val = getattr(row, column.name)
                    if isinstance(val, str) and "atunus" in val.lower():
                        is_atunus = True
                        break
                if is_atunus:
                    db.delete(row)
                    deleted += 1
            print(f"Deleted {deleted} rows from {table.__name__} mentioning Atunus.")

        db.commit()
        print("Cleanup complete.")
    except Exception as e:
        db.rollback()
        print(f"Error during cleanup: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
