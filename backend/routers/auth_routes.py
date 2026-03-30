"""
Cozhaven — Auth Routes
Registration, login, and token validation endpoints.
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from auth import hash_password, verify_password, create_access_token, get_current_user
from database import get_db
from schemas import UserCreate, UserLogin
from models import User
from limiter import limiter
from logger import get_logger

logger = get_logger("auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _set_auth_cookie(response: Response, token: str):
    """Utility to set the JWT in an HttpOnly cookie."""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Should be True in production
        samesite="lax", # Change to "none" + secure=True for cross-domain if needed
        max_age=60 * 60 * 24 * 7, # 7 days
    )

@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, response: Response, user_schema: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.email == user_schema.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    new_user = User(
        email=user_schema.email,
        password_hash=hash_password(user_schema.password),
        first_name=user_schema.first_name,
        last_name=user_schema.last_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role},
        expires_delta=timedelta(days=7)
    )

    _set_auth_cookie(response, access_token)
    logger.info("user_registered", user_id=new_user.id, email=new_user.email)

    return {
        "status": "ok",
        "user_id": new_user.id,
        "role": new_user.role
    }

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, response: Response, login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        logger.warning("login_failed", email=login_data.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(days=7)
    )

    _set_auth_cookie(response, access_token)
    
    return {
        "status": "ok",
        "user_id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "role": user.role
    }

@router.post("/logout")
async def logout(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie("access_token")
    return {"status": "ok"}

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """Validate token and return current user info. Used by frontend on page load."""
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role
    }

