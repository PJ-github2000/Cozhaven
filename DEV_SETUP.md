# Development Setup

## Architecture

Frontend and backend run as separate services:

- **Frontend**: Vite dev server on `http://localhost:5173`
- **Backend**: FastAPI on `http://localhost:8000`
- Vite proxies `/api` requests to backend automatically

## Quick Start

### 1. Start Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 2. Start Frontend

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 3. Access the App

Open: `http://localhost:5173`

All API calls are proxied to backend automatically during development.

## Production Build

### Build Frontend

```bash
npm run build
```

Output: `dist/` folder

### Deploy

- **Frontend**: Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages)
- **Backend**: Deploy FastAPI to any Python host (Railway, Render, AWS)
- Set `VITE_API_URL` environment variable to your backend URL

Example:
```env
VITE_API_URL=https://your-api.example.com/api
```

## Environment Variables

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend (.env)

```env
FRONTEND_URL=http://localhost:5173
DATABASE_URL=sqlite:///./cozhaven.db
STRIPE_SECRET_KEY=sk_test_...
```

## CORS

Backend CORS is configured to allow:
- `http://localhost:5173` (Vite dev)
- `http://localhost:4173` (Vite preview)
- Your production `FRONTEND_URL`
