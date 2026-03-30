import json
import re
import os

def parse_pdf_text(text_path, products_json_path):
    # Load existing products for metadata
    with open(products_json_path, 'r', encoding='utf-8') as f:
        site_products = json.load(f)

    with open(text_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    blocks = []
    current_block = {"items": [], "models": []}
    
    # Simple state machine to group prices and models
    # We collect items (name + price) and model names/numbers
    # When we see a "--- PAGE ---" or a major category, we might flush
    
    for line in lines:
        line = line.strip()
        if not line or "www.matrixfurnituregroup.ca" in line:
            continue
            
        # Match price line: "Product Name ... $ 1234"
        price_match = re.search(r'^(.*?)\s+\$\s*(\d+)$', line)
        if price_match:
            item_name = price_match.group(1).strip()
            price = int(price_match.group(2))
            current_block["items"].append({"name": item_name, "price": price})
            continue
            
        # Match standalone price: "PRICE $ 1234"
        standalone_price = re.search(r'PRICE\s+\$?\s*(\d+)', line, re.IGNORECASE)
        if standalone_price:
             current_block["items"].append({"name": "Special", "price": int(standalone_price.group(1))})
             continue

        # Match model identifier: "1234 NAME" or "851 BALTIMORE 852 AUSTIN"
        # We look for 3-4 digit numbers
        model_matches = re.findall(r'(\d{3,4})\s+([A-Z\s\']+)', line)
        if model_matches:
            for m_id, m_name in model_matches:
                current_block["models"].append({"id": m_id, "name": m_name.strip()})
            continue
            
        # If we have models and items, and encounter a separator or new category
        if "--- PAGE ---" in line or line.isupper() and len(line) > 5:
            if current_block["models"] and current_block["items"]:
                blocks.append(current_block)
                current_block = {"items": [], "models": []}
            elif "--- PAGE ---" in line:
                 # Carry items/models to next page if block is incomplete?
                 # Actually, usually a block stays on one page.
                 if current_block["models"] or current_block["items"]:
                    # Just flush it if it's substantial
                    if len(current_block["items"]) > 0:
                        blocks.append(current_block)
                    current_block = {"items": [], "models": []}

    # Final flush
    if current_block["items"]:
        blocks.append(current_block)

    # Pre-extract category-specific images from the site catalog
    category_images = {
        "BED": [p['image'] for p in site_products if 'BED' in p['product_name'].upper() and p['image']],
        "SOFA": [p['image'] for p in site_products if any(word in p['product_name'].upper() for word in ['SOFA', 'LOVESEAT', 'COUCH']) and p['image']],
        "TABLE": [p['image'] for p in site_products if 'TABLE' in p['product_name'].upper() and p['image']],
        "CHEST": [p['image'] for p in site_products if 'CHEST' in p['product_name'].upper() and p['image']],
        "NIGHTSTAND": [p['image'] for p in site_products if 'NIGHTSTAND' in p['product_name'].upper() and p['image']],
        "DRESSER": [p['image'] for p in site_products if 'DRESSER' in p['product_name'].upper() and p['image']],
    }
    
    # Generic site-wide product images for extreme fallback
    all_site_product_images = [p['image'] for p in site_products if p['image']]

    # Function to get context-aware image
    def get_best_image(model_id, model_name, item_name):
        # 1. Direct match by SKU or model number
        match = next((p for p in site_products if model_id in p['product_name']), None)
        if match: return match['image'], match['category'], match['url']
        
        # 2. String search for model name
        match = next((p for p in site_products if model_name.upper() in p['product_name'].upper()), None)
        if match: return match['image'], match['category'], match['url']
        
        # 3. Category fallback from site
        item_upper = item_name.upper()
        for cat, images in category_images.items():
            if cat in item_upper and images:
                 # Use a stable hash-based index or just the first
                 idx = hash(model_id + item_name) % len(images)
                 return images[idx], "Local Collection", ""
        
        # 4. Ultimate site product fallback
        if all_site_product_images:
            idx = hash(model_id) % len(all_site_product_images)
            return all_site_product_images[idx], "Local Collection", ""
            
        return "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp", "Local Collection", ""

    # Now flatten and merge
    result = []
    for block in blocks:
        for model in block["models"]:
            for item in block["items"]:
                img, cat, url = get_best_image(model['id'], model['name'], item['name'])
                
                full_name = f"{model['id']} {model['name']} {item['name']}"
                base_price = item['price']
                sale_price = round(base_price * 1.4, 2)
                
                result.append({
                    "sku": f"LCL-{model['id']}-{item['name'].split()[0].upper()}",
                    "name": full_name,
                    "cost_price": base_price,
                    "sale_price": sale_price,
                    "category": cat if cat else "Local Collection",
                    "image": img,
                    "url": url,
                    "description": f"Premium {item['name']} from our local {model['name']} collection. High-quality craftsmanship and modern design.",
                    "stock": "Available",
                    "variations": []
                })

    return result

if __name__ == "__main__":
    products = parse_pdf_text("pdf_extracted_text.txt", "cozhaven_products.json")
    # De-duplicate by name
    unique_products = {p['name']: p for p in products}.values()
    
    with open('local_collection.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_products), f, indent=2)
    print(f"Parsed {len(unique_products)} local products from PDF.")
