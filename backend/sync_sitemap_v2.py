import xml.etree.ElementTree as ET
import os
import sys
import random
import json
from decimal import Decimal

# Add backend to path so we can import models and database
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Product, Variant, MediaAsset, ProductSEO, Category, ProductOption, ProductOptionValue, VariantOptionValue, Base

def slug_to_name(slug):
    # Remove trailing slash
    slug = slug.strip('/')
    # Split by dashes
    parts = slug.split('-')
    # Remove 'copy' if it's the last part or similar artifacts
    if parts and parts[-1] == 'copy':
        parts = parts[:-1]
    # Join and capitalize
    name = ' '.join(parts).title()
    # Clean branding artifacts
    name = name.replace("Atunus Home", "").replace("Atunus", "").replace("Furniture", "").strip()
    # Remove double spaces
    name = ' '.join(name.split())
    return name

def map_category(name):
    combined = name.lower()
    if 'sectional' in combined: return 'sectionals'
    if 'sofa' in combined or 'couch' in combined: return 'sofas'
    if 'chair' in combined or 'stool' in combined: return 'chairs'
    if 'table' in combined or 'desk' in combined: return 'tables'
    if 'dining' in combined: return 'dining'
    if 'lighting' in combined or 'lamp' in combined: return 'lighting'
    if 'bed' in combined or 'mattress' in combined: return 'bedroom'
    if 'vanity' in combined: return 'vanity'
    if 'dresser' in combined or 'cabinet' in combined or 'sideboard' in combined: return 'storage'
    if 'decor' in combined or 'mirror' in combined: return 'living-room'
    return 'living-room'

def main():
    sitemap_path = os.path.join(os.path.dirname(__file__), '..', 'product-sitemap.xml')
    if not os.path.exists(sitemap_path):
        print(f"Error: {sitemap_path} not found.")
        return

    print("Parsing sitemap...")
    tree = ET.parse(sitemap_path)
    root = tree.getroot()

    # Namespaces
    ns = {
        's': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'image': 'http://www.google.com/schemas/sitemap-image/1.1'
    }

    products_data = []
    for url_tag in root.findall('s:url', ns):
        loc = url_tag.find('s:loc', ns).text
        if '/product/' not in loc:
            continue
        
        slug = loc.split('/product/')[1].strip('/')
        name = slug_to_name(slug)
        
        images = []
        for img_tag in url_tag.findall('image:image', ns):
            img_loc = img_tag.find('image:loc', ns).text
            images.append(img_loc)
        
        products_data.append({
            'name': name,
            'slug': slug,
            'url': loc,
            'images': ','.join(images) if images else ''
        })

    print(f"Found {len(products_data)} products in sitemap.")
    
    db = SessionLocal()
    try:
        # Step 1: CLEAR RELATED TABLES TO ENSURE CLEAN STATE
        print("Recreating product and related tables...")
        # Order matters for foreign keys in some DBs, but checkfirst=True helps.
        # Actually, let's just list the tables we want to reset.
        tables_to_reset = [
            'variant_option_values', 'product_option_values', 'product_options',
            'media_assets', 'product_seo', 'scheduled_prices', 'related_products',
            'user_recent_views', 'variants', 'products'
        ]
        
        # We'll use metadata to drop/create tables by name if possible, or just use the classes
        models_to_reset = [
            VariantOptionValue, ProductOptionValue, ProductOption,
            MediaAsset, ProductSEO, Variant, Product
        ]
        
        for model in models_to_reset:
            model.__table__.drop(bind=engine, checkfirst=True)
            model.__table__.create(bind=engine)
            
        # Step 2: SEED NEW ONES
        count = 0
        for p in products_data:
            # Generate random realistic furniture price
            price_val = random.randint(450, 2450)
            price = Decimal(str(price_val)) + Decimal("0.99")
            orig_price = price * Decimal("1.25")
            
            new_prod = Product(
                name=p['name'],
                slug=p['slug'],
                price=price,
                original_price=orig_price,
                description=f"Modern {p['name']} from our premium collection. Designed for both comfort and style, this piece elevates any living space with its contemporary aesthetic. Crafted with meticulous attention to detail using high-quality materials.",
                short_description=f"Elegant {p['name']} with premium materials.",
                category=map_category(p['name']),
                subcategory="Furniture",
                stock=random.randint(5, 50),
                images=p['images'],
                colors="#C9B8A8,#2A2622,#EAE0D5",
                colorNames="Italian Linen,Midnight Sante,Warm Sand",
                sizes="Standard,7-Seater,Modular",
                materials="Imported Italian Linen, Solid Birchwood",
                configurations="Standard",
                is_canadian_made=1,
                badge="New Arrival",
                sale_percent=20,
                rating=4.5 + (random.random() * 0.5),
                reviews=random.randint(5, 100),
                specs=json.dumps({"Source": "Sitemap", "ExternalURL": p['url']}),
                status="active"
            )
            db.add(new_prod)
            db.flush() # To get the id
            
            # Create Default Variant
            new_variant = Variant(
                product_id=new_prod.id,
                title="Standard",
                sku=f"CH-{new_prod.id:05d}-ST",
                price=price,
                compare_at_price=orig_price,
                status="active",
                position=1
            )
            db.add(new_variant)
            
            # Create SEO entry
            seo = ProductSEO(
                product_id=new_prod.id,
                meta_title=f"{p['name']} | Cozhaven Furniture",
                meta_description=f"Buy {p['name']} online. {new_prod.short_description}",
                canonical_url=p['url']
            )
            db.add(seo)

            count += 1
            if count % 50 == 0:
                print(f"Added {count} products and variants...")
        
        db.commit()
        print(f"Successfully replaced all products. Added {count} new products from sitemap.")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
