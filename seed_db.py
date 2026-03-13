import json
import sqlite3
import re
import os

def extract_products():
    with open('src/data/products.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract the PRODUCTS array using a simple regex since it's a JS object dump
    match = re.search(r'const\s+PRODUCTS\s*=\s*\[(.*?)\];', content, re.DOTALL)
    if not match:
        print("Could not find PRODUCTS array")
        return []
    
    items_str = match.group(1)
    # Split by object
    items_raw = re.split(r'},\s*{', items_str)
    
    products = []
    
    for item in items_raw:
        item = item.strip().strip('{').strip('}')
        
        # Simple extraction
        name_match = re.search(r'name:\s*"([^"]+)"', item)
        price_match = re.search(r'price:\s*(\d+)', item)
        desc_match = re.search(r'description:\s*"([^"]+)"', item)
        cat_match = re.search(r'category:\s*"([^"]+)"', item)
        imgs_match = re.search(r'images:\s*\[(.*?)\]', item)
        
        if name_match and price_match and cat_match:
            imgs = []
            if imgs_match:
                img_str = imgs_match.group(1)
                imgs = [i.strip(' "') for i in img_str.split(',') if i.strip()]
            
            p = {
                'name': name_match.group(1),
                'price': float(price_match.group(1)),
                'description': desc_match.group(1) if desc_match else "",
                'category': cat_match.group(1),
                'stock': 100,
                'images': ",".join(imgs)
            }
            products.append(p)
            
    return products

def seed_db():
    products = extract_products()
    if not products:
        return
        
    db_path = 'backend/cozhaven.db'
    if not os.path.exists('backend'):
        os.makedirs('backend')
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables if not exist based on main.py definitions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            stock INTEGER DEFAULT 0,
            images TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Clear existing and insert new
    cursor.execute("DELETE FROM products")
    
    for p in products:
        cursor.execute("""
            INSERT INTO products (name, price, description, category, stock, images)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (p['name'], p['price'], p['description'], p['category'], p['stock'], p['images']))
        
    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(products)} products into the database.")

if __name__ == '__main__':
    seed_db()
