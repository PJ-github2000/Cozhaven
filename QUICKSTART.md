# Quick Start

## First Time Setup

```bash
# 1. Setup Frontend
cp .env.example .env
# Edit .env with your Stripe publishable key

# 2. Setup Backend
cd backend
cp .env.example .env
# Edit .env with your Stripe secret key
# Generate SECRET_KEY: openssl rand -hex 32

# 3. Install dependencies
cd ..
npm install

# 4. Start both services
npm run dev:all
```

## Daily Development

```bash
# Start everything
npm run dev:all

# Or separately:
# Terminal 1 - Backend
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
npm run dev
```

## Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Environment Files

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `/.env` | Frontend dev config | ❌ No |
| `/.env.example` | Frontend template | ✅ Yes |
| `/backend/.env` | Backend dev config | ❌ No |
| `/backend/.env.example` | Backend template | ✅ Yes |

## Get Stripe Keys

1. https://dashboard.stripe.com/test/apikeys
2. Publishable key (`pk_...`) → Frontend `.env`
3. Secret key (`sk_...`) → Backend `.env`

For full documentation, see [ENV_SETUP.md](./ENV_SETUP.md)
