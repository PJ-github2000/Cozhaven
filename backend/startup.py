"""
Cozhaven — Automated Startup Script
Handles database migration, seeding, and server launch.
Works with both SQLite (local) and PostgreSQL (production).

Usage:
  python startup.py              # Default: migrate + seed if empty + start server
  python startup.py --seed       # Force re-seed (wipes products table)
  python startup.py --migrate    # Only run migrations, no server
  python startup.py --no-seed    # Skip auto-seed, just migrate + start
"""
import os
import sys
import json
import argparse
import random

# Ensure backend is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATABASE_URL
from database import engine, SessionLocal, init_db
from models import Base, Product


def get_db_type():
    """Detect database type from URL."""
    if "postgresql" in DATABASE_URL or "postgres" in DATABASE_URL:
        return "postgresql"
    return "sqlite"


def run_migrations():
    """Create all tables if they don't exist."""
    db_type = get_db_type()
    print(f"🔧 Running migrations on {db_type}...")
    print(f"   URL: {DATABASE_URL[:50]}...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created/verified successfully.")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False


def count_products():
    """Count existing products in database."""
    db = SessionLocal()
    try:
        return db.query(Product).count()
    except Exception:
        return 0
    finally:
        db.close()


def seed_products(force=False):
    """
    Seed products from atunus_products.json.
    Only seeds if table is empty unless force=True.
    """
    existing = count_products()
    
    if existing > 0 and not force:
        print(f"ℹ️  Database already has {existing} products. Skipping seed.")
        print("   Use --seed flag to force re-seed.")
        return True
    
    # Locate JSON data
    json_path = os.path.join(
        os.path.dirname(__file__), '..', 'scripts', 'scraping', 'atunus_products.json'
    )
    
    if not os.path.exists(json_path):
        print(f"⚠️  Seed data not found at: {json_path}")
        print("   Run the Atunus scraper first, or place atunus_products.json in scripts/scraping/")
        return False
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to read seed data: {e}")
        return False
    
    print(f"🌱 Seeding {len(products_data)} products...")
    
    db = SessionLocal()
    try:
        if force and existing > 0:
            print(f"   Clearing {existing} existing products...")
            db.query(Product).delete()
            db.commit()
        
        count = 0
        for p in products_data:
            try:
                price_val = _parse_price(p.get('price', '0'))
                orig_price_val = price_val * 1.25 if price_val > 0 else None
                
                new_product = Product(
                    name=p['product_name'],
                    price=price_val,
                    original_price=orig_price_val,
                    description=p.get('description', ''),
                    category=_map_category(p),
                    subcategory=p.get('category', ''),
                    stock=random.randint(2, 25),
                    images=p.get('image', ''),
                    colors="#C9B8A8,#2A2622,#EAE0D5",
                    colorNames="Italian Linen,Midnight Sante,Warm Sand",
                    sizes="Standard,7-Seater,Modular",
                    materials="Imported Italian Linen, Solid Birchwood",
                    configurations="Standard",
                    is_canadian_made=0,
                    badge="designer",
                    sale_percent=20,
                    rating=round(random.uniform(4.5, 5.0), 1),
                    reviews=random.randint(5, 42),
                    specs=json.dumps({
                        "Source": "Designer Series",
                        "ExternalURL": p.get('url', '')
                    }),
                    status="active"
                )
                db.add(new_product)
                count += 1
            except Exception as item_err:
                print(f"   ⚠️  Skipping: {p.get('product_name', 'unknown')}: {item_err}")
        
        db.commit()
        print(f"✅ Successfully seeded {count} products.")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        return False
    finally:
        db.close()


def _parse_price(raw):
    """Parse price string, scale if unrealistically low for furniture."""
    try:
        val = float(str(raw).replace(',', '').replace('$', ''))
    except (ValueError, TypeError):
        val = 0.0
    
    if val > 0 and val < 100:
        return val * 100 if val > 10 else val * 1000
    elif val == 0:
        return float(random.randint(1200, 4500))
    return val


def _map_category(p):
    """Map product to internal category based on name + original category."""
    name = p.get('product_name', '').lower()
    cat = p.get('atunus_category', p.get('category', '')).lower()
    combined = f"{name} {cat}"
    
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


def start_server():
    """Launch the FastAPI server with uvicorn."""
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"\n🚀 Starting Cozhaven server on {host}:{port}")
    print(f"   Database: {get_db_type()}")
    print(f"   Debug: {debug}\n")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )


def main():
    parser = argparse.ArgumentParser(description="Cozhaven Startup Script")
    parser.add_argument('--seed', action='store_true', help='Force re-seed products (wipes existing)')
    parser.add_argument('--migrate', action='store_true', help='Only run migrations, skip server')
    parser.add_argument('--no-seed', action='store_true', help='Skip auto-seeding')
    parser.add_argument('--no-server', action='store_true', help='Skip server start')
    args = parser.parse_args()
    
    print("=" * 50)
    print("🏡 COZHAVEN — Startup")
    print("=" * 50)
    
    # Step 1: Migrations
    if not run_migrations():
        print("❌ Aborting: migrations failed.")
        sys.exit(1)
    
    if args.migrate:
        print("\n✅ Migration-only mode complete.")
        return
    
    # Step 2: Seeding
    if not args.no_seed:
        seed_products(force=args.seed)
    else:
        print("ℹ️  Seeding skipped (--no-seed flag).")
    
    # Step 3: Server
    if not args.no_server:
        start_server()
    else:
        print("\n✅ Startup complete (no server).")


if __name__ == "__main__":
    main()
