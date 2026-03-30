"""
Cozhaven — Application Entry Point
Slim app factory: middleware, rate limiting, router registration, frontend serving.
"""
import os
import stripe
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from logger import configure_logger, get_logger, log_request_middleware

# Initialize structured logging
configure_logger(debug=os.getenv("DEBUG", "false").lower() == "true")
logger = get_logger("main")

from limiter import limiter

from config import FRONTEND_URL, UPLOAD_DIR, STRIPE_SECRET_KEY
from database import init_db
from redis_cache import init_redis

# ─── Configure Stripe ───
stripe.api_key = STRIPE_SECRET_KEY
if not stripe.api_key:
    logger.warning("stripe_key_missing", detail="STRIPE_SECRET_KEY not set. Payments will fail.")

# ─── FastAPI App ───
app = FastAPI(title="Cozhaven API")
app.middleware("http")(log_request_middleware)

# ─── Rate Limiter ───
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS (environment-aware) ───
_cors_origins = [FRONTEND_URL]
if "localhost" in FRONTEND_URL or "127.0.0.1" in FRONTEND_URL:
    _cors_origins.extend(["http://localhost:5173", "http://localhost:4173"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Stripe-Signature"],
)

# ─── Security Headers (H13) ───
@app.middleware("http")
async def security_headers_middleware(request, call_next):
    response = await call_next(request)
    
    # ─── Content Security Policy (Staff standard) ───
    # We allow Stripe, Google Fonts, and self.
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://js.stripe.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://*.stripe.com https://candb.ca https://atunus.com https://*.atunus.com https://atunushome.com https://*.atunushome.com https://v.fastly.net https://i.ebayimg.com; "
        "frame-src 'self' https://js.stripe.com https://hooks.stripe.com; "
        "connect-src 'self' https://api.stripe.com; "
        "object-src 'none';"
    )
    
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Force HSTS in production (1 year)
    if os.getenv("DEBUG", "false").lower() == "false":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
    return response

# ─── Serve Uploads ───
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ─── Register Routers ───
from routers.auth_routes import router as auth_router
from routers.products import router as products_router
from routers.orders import router as orders_router
from routers.checkout import router as checkout_router
from routers.admin import router as admin_router
from routers.seo import router as seo_router
from routers.collections import router as collections_router
from routers.cms import router as cms_router, public_router as cms_public_router
from routers.categories import router as categories_router
from routers.discovery import router as discovery_router

# Routers are now rate-limited via decorators in their respective files

app.include_router(auth_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(checkout_router)
app.include_router(admin_router)
app.include_router(seo_router)
app.include_router(collections_router)
app.include_router(cms_router)
app.include_router(cms_public_router)
app.include_router(categories_router)
app.include_router(discovery_router)

# ─── Health Check ───
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": os.getloadavg() if hasattr(os, 'getloadavg') else None,
        "pid": os.getpid()
    }

# ─── Database Initialization ───
@app.on_event("startup")
async def startup_event():
    init_db()
    await init_redis()

# ─── Serve Frontend (must be last — catch-all route) ───
# Check for dist at /app/dist (container) or ../dist (dev)
PARENT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_DIST_PATHS = [
    os.path.join(PARENT_DIR, "..", "dist"),      # Standard local/Docker structure
    os.path.join(PARENT_DIR, "dist"),           # Direct backend subfolder
    "/app/dist"                                # Explicit Docker absolute path
]

DIST_DIR = None
for path in POSSIBLE_DIST_PATHS:
    if os.path.exists(path):
        DIST_DIR = path
        break

if not DIST_DIR:
    logger.error("dist_folder_missing", detail="Could not find frontend 'dist' folder.")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """
    Serve the frontend build. If the path looks like an API call but isn't matched above,
    404. Otherwise, serve from dist or fallback to index.html for SPA routing.
    """
    from fastapi import HTTPException
    
    # Ignore API routes that might have trickled down
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    if not DIST_DIR:
       return {"error": "Frontend build not found. Run build first."}

    # 1. Try to serve the exact file (css, js, images)
    file_path = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # 2. Fallback to index.html for SPA routes (e.g. /shop, /product/1, /admin/dashboard)
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)

    raise HTTPException(status_code=404, detail="File not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
