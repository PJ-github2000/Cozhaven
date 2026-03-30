"""
Cozhaven — Application Configuration
Loads environment variables and defines all constants.
"""
import os
from dotenv import load_dotenv

# Load .env file — try root directory first, then fallback to local directory
base_dir = os.path.dirname(os.path.abspath(__file__))
root_env = os.path.join(os.path.dirname(base_dir), ".env")
if os.path.exists(root_env):
    load_dotenv(root_env)
else:
    load_dotenv()

# ─── Core Auth ───
SECRET_KEY = os.getenv("SECRET_KEY")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

if not SECRET_KEY and not DEBUG:
    raise RuntimeError(
        "FATAL: SECRET_KEY environment variable MUST be set for production. "
        "Generate one with: python -c 'import secrets; print(secrets.token_hex(32))'"
    )

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

# ─── Stripe ───
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# ─── CORS / Frontend URL ───
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ─── Database & Cache ───
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cozhaven.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
UPLOAD_DIR = "uploads"

# Normalize SQLite URL for SQLAlchemy
if DATABASE_URL.startswith("sqlite"):
    if ":///" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("sqlite:", "sqlite:///")

# Handle postgres:// vs postgresql:// (Heroku/Railway compatibility)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ─── Canadian Tax Rates (GST/HST/PST) ───
CANADIAN_TAX_RATES = {
    "ON": {"label": "HST", "rate": 0.13},
    "QC": {"label": "GST+QST", "rate": 0.14975},
    "BC": {"label": "GST+PST", "rate": 0.12},
    "AB": {"label": "GST", "rate": 0.05},
    "SK": {"label": "GST+PST", "rate": 0.11},
    "MB": {"label": "GST+PST", "rate": 0.12},
    "NS": {"label": "HST", "rate": 0.15},
    "NB": {"label": "HST", "rate": 0.15},
    "NL": {"label": "HST", "rate": 0.15},
    "PE": {"label": "HST", "rate": 0.15},
}

# ─── Shipping Rates ───
SHIPPING_RATES = {
    "standard": 0,
    "express": 49,
    "whiteGlove": 149,
}
