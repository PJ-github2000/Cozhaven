
import sys
import os
from sqlalchemy.orm import Session

# Add current directory to path to import local modules
sys.path.append(os.getcwd())

from database import SessionLocal
from models import Product, ProductOption, ProductOptionValue, Variant, VariantOptionValue, InventoryItem

def backfill_products():
    db = SessionLocal()
    try:
        products = db.query(Product).all()
        print(f"Starting backfill for {len(products)} products...")

        for product in products:
            # 1. Ensure Product has a Slug (if missing)
            if not product.slug:
                from utils import slugify
                product.slug = slugify(product.name)
            
            # 2. Check if product already has variants
            if product.variants:
                print(f"Product {product.id} ({product.name}) already has variants. Skipping backfill.")
                continue

            print(f"Processing Product {product.id}: {product.name}")

            # 3. Create Default Variant
            # If it's a simple product, it just needs one variant
            default_variant = Variant(
                product_id=product.id,
                title="Default",
                sku=f"CH-{product.id:05d}",
                price=product.price,
                compare_at_price=product.original_price,
                status="active",
                position=1
            )
            db.add(default_variant)
            db.flush()

            # 4. Create Inventory Item
            inventory = InventoryItem(
                variant_id=default_variant.id,
                available_quantity=product.stock or 0,
                track_inventory=1
            )
            db.add(inventory)

            # 5. Handle Legacy Options (Colors/Sizes)
            # For simplicity in this backfill, if they have options, we keep the default variant
            # but we could optionally blow them out into multiple variants here.
            # Most existing data seems to be "Simple" with selection strings.
            
            if product.colors:
                opt = ProductOption(product_id=product.id, name="Color", position=1)
                db.add(opt)
                db.flush()
                for i, val in enumerate(product.colors.split(',')):
                    v = ProductOptionValue(option_id=opt.id, value=val.strip(), position=i+1)
                    db.add(v)

            if product.sizes:
                opt = ProductOption(product_id=product.id, name="Size", position=2)
                db.add(opt)
                db.flush()
                for i, val in enumerate(product.sizes.split(',')):
                    v = ProductOptionValue(option_id=opt.id, value=val.strip(), position=i+1)
                    db.add(v)

        db.commit()
        print("Backfill completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error during backfill: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    backfill_products()
