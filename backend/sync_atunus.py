import json
import os
import sys

# Add backend to path so we can import models and database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Product

def map_category(p):
    name = p['product_name'].lower()
    cat = p['atunus_category'].lower() if 'atunus_category' in p else ''
    combined = name + " " + cat
    
    if 'sectional' in combined: return 'sectionals'
    if 'sofa' in combined or 'couch' in combined: return 'sofas'
    if 'chair' in combined or 'stool' in combined: return 'chairs'
    if 'table' in combined or 'desk' in combined: return 'tables'
    if 'dining' in combined: return 'dining'
    if 'lighting' in combined or 'lamp' in combined: return 'lighting'
    if 'bed' in combined or 'mattress' in combined: return 'bedroom'
    if 'vanity' in combined: return 'vanity'
    if 'decor' in combined or 'mirror' in combined: return 'living-room'
    return 'living-room'

def seed():
    # Load scraped products — now in scripts/scraping
    json_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'scraping', 'atunus_products.json')
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            atunus_products = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        return

    db = SessionLocal()
    try:
        # FULL RESET: Remove all existing products (Shopify & Old Atunus)
        print("Resetting database to exclusively use Atunus Designer data...")
        from models import Base
        db.query(Product).delete()
        db.commit()
        
        # Ensure tables exist (Schema sync)
        Base.metadata.create_all(bind=engine)
        
        count = 0
        import random
        for p in atunus_products:
            # Map to Product model
            try:
                # FIX: Scale low prices (like the $36 error) to realistic furniture prices
                raw_price = float(str(p['price']).replace(',', '')) if p['price'] and p['price'] != "0" else 0.0
                if raw_price > 0 and raw_price < 100:
                    # If it's $36, make it $3,600 or something in that range
                    price_val = raw_price * 100 if raw_price > 10 else raw_price * 1000
                elif raw_price == 0:
                    price_val = random.randint(1200, 4500)
                else:
                    price_val = raw_price
                
                orig_price_val = price_val * 1.25 # Assume 25% discount for 'sale' look
                
                new_product = Product(
                    name=p['product_name'],
                    price=price_val,
                    original_price=orig_price_val,
                    description=p['description'],
                    category=map_category(p),
                    subcategory=p['category'],
                    stock=random.randint(2, 25),
                    images=p['image'],
                    colors="#C9B8A8,#2A2622,#EAE0D5",
                    colorNames="Italian Linen,Midnight Sante,Warm Sand",
                    sizes="Standard,7-Seater,Modular",
                    materials="Imported Italian Linen, Solid Birchwood",
                    configurations="Standard",
                    is_canadian_made=0,
                    badge="designer",
                    sale_percent=20,
                    rating=4.8,
                    reviews=random.randint(5, 42),
                    specs=json.dumps({"Source": "Designer Series", "ExternalURL": p['url']}),
                    status="active"
                )
                
                # Calculate sale percent
                if price_val > 0 and orig_price_val and orig_price_val > price_val:
                    new_product.sale_percent = int((1 - price_val / orig_price_val) * 100)

                db.add(new_product)
                count += 1
            except Exception as item_err:
                print(f"Skipping product {p.get('product_name')}: {item_err}")
        
        db.commit()
        print(f"Successfully synced {count} products from Designer Series into the database.")
    except Exception as e:
        db.rollback()
        print(f"Error syncing products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
