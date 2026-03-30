import json
import re
import os

def parse_local_txt(file_path):
    # Load Cozhaven products for image mapping
    all_products = []
    if os.path.exists('cozhaven_products.json'):
        with open('cozhaven_products.json', 'r', encoding='utf-8') as f:
            all_products = json.load(f)

    def find_best_image(sku, name, url):
        # 1. Exact URL match
        if url:
            clean_url = url.split('?')[0].strip('/')
            for p in all_products:
                if p.get('url', '').split('?')[0].strip('/') == clean_url:
                    return p.get('image', '')
        
        # 2. SKU/Name keyword match
        keywords = re.findall(r'[A-Za-z0-9]+', (sku + " " + name).lower())
        keywords = [k for k in keywords if len(k) > 2 and k not in ['the', 'and', 'for', 'sofa', 'couch', 'chair']]
        
        best_match = None
        max_score = 0
        
        for p in all_products:
            p_name = p.get('product_name', '').lower()
            score = sum(1 for k in keywords if k in p_name)
            if score > max_score:
                max_score = score
                best_match = p.get('image', '')
        
        if max_score > 0:
            return best_match
            
        # 3. Category Fallback Image (using actual site images)
        if "SF" in sku or "couch" in name.lower():
            return "https://atunus.com/wp-content/uploads/2025/04/Sky-Cloud-Deluxe-Adjustable-Sectional-Sofa-Comfort-Relaxation-125-Inch-Velvet-Corner-Sectionals-2-Seaters-Atunus-1.webp"
        if "DT" in sku or "Dining" in name.lower():
             return "https://atunus.com/wp-content/uploads/2025/06/71-Inch-Modern-Dining-Table-1-1750239726.webp"
        
        return "https://atunus.com/wp-content/uploads/2025/04/Pixel-Classic-Modular-Sofa-Adaptable-Comfort-Linen-Sofa-Sets-4-Seaters-Atunus-1.webp"

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    products = []
    current_product = None

    for line in lines[1:]:
        parts = [p.strip() for p in line.split('\t')]
        if not any(parts): continue
            
        sku = parts[0] if len(parts) > 0 else ""
        
        # Valid SKU check
        is_sku = sku and (re.match(r'^[A-Z0-9-]{3,}', sku) or any(x in sku.lower() for x in ["couch", "bed", "chair", "stand", "bubble"]))
        
        if is_sku:
            if current_product: products.append(current_product)
            
            url = parts[8] if len(parts) > 8 else ""
            
            # Categories based on SKU
            category = "Sofas & Sectionals"
            if any(x in sku.lower() for x in ["dt", "dc", "dinning"]): category = "Dining"
            elif any(x in sku.lower() for x in ["bed", "b2"]): category = "Beds"
            elif any(x in sku.lower() for x in ["ct", "ac", "st", "chair"]): category = "Accents"

            p_name = sku
            if url:
                nm = re.search(r'/products/([^/?]+)', url)
                if nm: p_name = nm.group(1).replace('-', ' ').title()

            current_product = {
                "sku": sku,
                "name": p_name,
                "category": category,
                "color": parts[2] if len(parts) > 2 else "",
                "detail": parts[3] if len(parts) > 3 else "",
                "price_cad": parts[5].replace('$', '').replace(',', '') if len(parts) > 5 else "0",
                "sale_price": parts[7].replace('$', '').replace(',', '') if len(parts) > 7 else "0",
                "url": url,
                "image": find_best_image(sku, p_name, url),
                "size": parts[10] if len(parts) > 10 else "",
                "stock": parts[14] if len(parts) > 14 else "",
                "variations": []
            }
        
        elif current_product:
            # Append multiline details or variations
            detail_extra = parts[3] if len(parts) > 3 else ""
            
            if ":" in detail_extra:
                current_product["variations"].append({"type": detail_extra.split(':')[0].strip(), "price": detail_extra.split(':')[1].strip()})
            elif detail_extra:
                current_product["detail"] += " " + detail_extra

    if current_product: products.append(current_product)
    return products

if __name__ == "__main__":
    try:
        data = parse_local_txt('local_products_collection.txt')
        data = [p for p in data if not re.match(r'^\d+\*\d+', p["sku"])]
        
        with open('imported_collection.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Parsed {len(data)} imported products with smart image matching.")
    except Exception as e:
        print(f"Error: {e}")
