from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import sqlite3
import os

# ─── Configuration ───
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ─── Database Setup ───
DATABASE_URL = "cozhaven.db"

def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# ─── Password Hashing ───
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ─── JWT Token ───
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ─── Pydantic Models ───
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    id: int
    name: str
    price: float
    description: str
    category: str
    stock: int
    images: List[str]

class CartItem(BaseModel):
    product_id: int
    quantity: int
    color: Optional[str] = None
    size: Optional[str] = None

class Order(BaseModel):
    user_id: int
    items: List[CartItem]
    shipping_address: str
    payment_method: str

# ─── FastAPI App ───
app = FastAPI(title="Cozhaven API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Database Initialization ───
def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Products table
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
    
    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Order items table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            color TEXT,
            size TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# ─── Authentication Routes ───
@app.post("/api/auth/register")
async def register(user: UserCreate):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    password_hash = hash_password(user.password)
    cursor.execute(
        "INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)",
        (user.email, password_hash, user.first_name, user.last_name)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user_id), "email": user.email},
        expires_delta=timedelta(days=7)
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get user
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user or not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(db_user["id"]), "email": db_user["email"]},
        expires_delta=timedelta(days=7)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": db_user["id"],
        "email": db_user["email"],
        "first_name": db_user["first_name"]
    }

# ─── Product Routes ───
@app.get("/api/products")
async def get_products(category: Optional[str] = None):
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if category:
        cursor.execute("SELECT * FROM products WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT * FROM products")
    
    products = []
    for row in cursor.fetchall():
        products.append({
            "id": row["id"],
            "name": row["name"],
            "price": row["price"],
            "description": row["description"],
            "category": row["category"],
            "stock": row["stock"],
            "images": row["images"].split(",") if row["images"] else []
        })
    
    conn.close()
    return products

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {
        "id": row["id"],
        "name": row["name"],
        "price": row["price"],
        "description": row["description"],
        "category": row["category"],
        "stock": row["stock"],
        "images": row["images"].split(",") if row["images"] else []
    }

# ─── Order Routes ───
@app.post("/api/orders")
async def create_order(order: Order):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Calculate total
    total_amount = 0
    for item in order.items:
        cursor.execute("SELECT price FROM products WHERE id = ?", (item.product_id,))
        product = cursor.fetchone()
        if product:
            total_amount += product["price"] * item.quantity
    
    # Create order
    cursor.execute(
        "INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)",
        (order.user_id, total_amount, order.shipping_address, order.payment_method)
    )
    order_id = cursor.lastrowid
    
    # Create order items
    for item in order.items:
        cursor.execute("SELECT price FROM products WHERE id = ?", (item.product_id,))
        product = cursor.fetchone()
        if product:
            cursor.execute(
                "INSERT INTO order_items (order_id, product_id, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?)",
                (order_id, item.product_id, item.quantity, product["price"], item.color, item.size)
            )
            
            # Update stock
            cursor.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ?",
                (item.quantity, item.product_id)
            )
    
    conn.commit()
    conn.close()
    
    return {"order_id": order_id, "status": "success", "total": total_amount}

@app.get("/api/users/{user_id}/orders")
async def get_user_orders(user_id: int):
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    orders = []
    for row in cursor.fetchall():
        orders.append({
            "id": row["id"],
            "total_amount": row["total_amount"],
            "status": row["status"],
            "created_at": row["created_at"]
        })
    
    conn.close()
    return orders

# ─── Health Check ───
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
