import sqlite3

def list_products():
    conn = sqlite3.connect('backend/cozhaven.db')
    curr = conn.cursor()
    # Check for designer products (Atunus Series)
    curr.execute("SELECT id, name, price, category FROM products WHERE badge='designer' LIMIT 50")
    rows = curr.fetchall()
    
    if not rows:
        print("No 'designer' products found. Fetching any products instead...")
        curr.execute("SELECT id, name, price, category FROM products LIMIT 20")
        rows = curr.fetchall()
        
    print(f"{'ID':<5} | {'Name':<40} | {'Price':<10} | {'Category'}")
    print("-" * 75)
    for r in rows:
        name = str(r[1]).strip().replace('\n', ' ')[:38]
        print(f"{r[0]:<5} | {name:<40} | ${r[2]:<9} | {r[3]}")
    
    conn.close()

if __name__ == '__main__':
    list_products()
