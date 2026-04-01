"""
Cozhaven — Automated Startup Script
Handles database migration, seeding, and server launch.
Works exclusively with PostgreSQL (production/local).

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
import sync_sitemap_v2


def get_db_type():
    """Detect database type from URL."""
    return "postgresql"


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
    Seed products securely from XML sitemap architecture.
    Only seeds if table is empty unless force=True.
    """
    existing = count_products()
    
    if existing > 0 and not force:
        print(f"ℹ️  Database already has {existing} products. Skipping seed.")
        print("   Use --seed flag to force re-seed.")
        return True
    
    print("🌱 Auto-seeding catalog natively from product-sitemap.xml...")
    try:
        sync_sitemap_v2.main()
        return True
    except Exception as e:
        print(f"❌ Sitemap seeding transaction failed: {e}")
        return False


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
