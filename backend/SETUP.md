# Backend Setup Instructions

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation Steps

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Create virtual environment (recommended)
```bash
python -m venv venv
```

### 3. Activate virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the server
```bash
python main.py
```

Server will start at: `http://localhost:8000`

## Test the API

Open browser and go to:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health

## Frontend Integration

The frontend will connect to the backend automatically. Make sure both servers are running:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000

## Default Database

SQLite database (`cozhaven.db`) is created automatically on first run with tables:
- users
- products  
- orders
- order_items

## Important Notes

⚠️ **Change the SECRET_KEY in production!** 
Find this line in `main.py`:
```python
SECRET_KEY = "your-secret-key-change-in-production"
```

Replace with a secure random string.

## CORS Configuration

Currently configured to allow requests from `http://localhost:5173` only. Update if needed.
