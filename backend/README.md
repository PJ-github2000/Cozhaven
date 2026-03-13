# Cozhaven Backend

FastAPI backend for Cozhaven e-commerce platform.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the server:**
```bash
python main.py
```

Server will start at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Add new product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/users/{user_id}/orders` - Get user orders

### Health Check
- `GET /api/health` - Check API health

## Database

SQLite database (`cozhaven.db`) is created automatically on first run.

Tables:
- users
- products
- orders
- order_items
