# Environment Configuration Guide

## Architecture

Frontend and backend have **separate** environment files:

```
cozhaven/
├── .env                    # Frontend (Vite) - Development
├── .env.example            # Frontend template
├── .env.local              # Frontend overrides (optional)
├── .env.production         # Frontend production
│
└── backend/
    ├── .env                # Backend (FastAPI) - Development
    └── .env.example        # Backend template
```

## Frontend Environment (`/.env`)

**Location**: Project root

**Variables**:
```env
# API URL
# Development: Vite proxies this to backend automatically
# Production: Set to your backend URL or use "/api" if same domain
VITE_API_URL=http://localhost:8000/api

# Stripe Publishable Key (starts with pk_)
# Get from: https://dashboard.stripe.com/test/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Important**:
- Only `VITE_` prefixed variables are exposed to the browser
- Never put backend secrets here
- `.env.local` overrides `.env` (add to .gitignore)

## Backend Environment (`/backend/.env`)

**Location**: `backend/` directory

**Required Variables**:
```env
# Security - Generate with: openssl rand -hex 32
SECRET_KEY=your_random_secret_key_here_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database
# SQLite (development):
DATABASE_URL=sqlite:///./cozhaven.db
# PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Stripe Secret Key (starts with sk_)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (from Stripe dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS - Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Optional Variables**:
```env
# Google Cloud Storage (for media uploads)
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
GCS_BUCKET_NAME=your-bucket-name
```

## Setup Steps

### 1. Frontend Setup

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Backend Setup

```bash
cd backend

# Copy example file
cp .env.example .env

# Edit with your values
nano .env

# Generate secure key
openssl rand -hex 32
```

### 3. Get Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy **Publishable key** (starts with `pk_`) → Frontend `.env`
3. Copy **Secret key** (starts with `sk_`) → Backend `.env`
4. For webhooks: https://dashboard.stripe.com/test/webhooks

## Production Deployment

### Frontend (`.env.production`)

```env
# If backend is on same domain:
VITE_API_URL=/api

# If backend is on different domain:
VITE_API_URL=https://api.yourdomain.com/api

# Use live Stripe key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Backend (`.env` on server)

```env
# Use PostgreSQL in production
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Disable debug
DEBUG=false

# Use live Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Your production frontend URL
FRONTEND_URL=https://www.yourdomain.com
```

## Security Notes

✅ **DO**:
- Keep all `.env` files out of version control
- Use different keys for development and production
- Generate strong random SECRET_KEY
- Use environment-specific Stripe keys

❌ **DON'T**:
- Commit `.env` files to Git
- Share secret keys in code or logs
- Use production keys in development
- Put backend secrets in frontend `.env`

## Verify Setup

### Test Frontend
```bash
npm run dev
# Open http://localhost:5173
# Check browser console for errors
```

### Test Backend
```bash
cd backend
python -m uvicorn app.main:app --reload
# Open http://localhost:8000/docs
# Should see Swagger UI
```

### Test Connection
```bash
# From browser console on http://localhost:5173
fetch('/api/health').then(r => r.json()).then(console.log)
# Should return: {status: "healthy", ...}
```

## Troubleshooting

**Frontend can't connect to backend**:
- Check `VITE_API_URL` is correct
- Ensure backend is running on port 8000
- Check CORS settings in backend `.env`

**Stripe errors**:
- Verify publishable key starts with `pk_`
- Verify secret key starts with `sk_`
- Don't mix test and live keys

**Database errors**:
- Check `DATABASE_URL` format
- For SQLite: ensure write permissions
- For PostgreSQL: verify credentials
