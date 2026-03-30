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

## Configuration

The application uses a shared `.env` file located in the project root for both frontend and backend configuration.

### 1. Development Environment
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### 2. Production Environment
A template is provided at `.env.production`. Ensure you set secure values for:
- `SECRET_KEY`: A long random hex string.
- `DATABASE_URL`: Your production database (e.g., PostgreSQL).
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Your live Stripe keys.

## Deployment

The application is prepared for deployment via Docker:
```bash
docker-compose up --build
```
This will start the FastAPI server and a PostgreSQL database. The backend is configured to serve the frontend build from the `dist` directory.

## Default Database

In development, a SQLite database (`cozhaven.db`) is created automatically. In production, provide a `DATABASE_URL` for PostgreSQL.

## Important Notes

⚠️ **Security First**: 
- Never commit your `.env` or `.env.production` files.
- Ensure `SECRET_KEY` is unique and kept private.
- Only the `VITE_` prefixed variables are exposed to the browser.
