from database import SessionLocal
from models import User
from passlib.context import CryptContext
import sys

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def recreate_admin():
    db = SessionLocal()
    try:
        # Define Admin Credentials
        admin_email = "admin@cozhaven.com"
        admin_pass = "cozhaven2026"
        
        # Check if exists (should be empty now)
        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"Admin {admin_email} already exists.")
            return

        admin_user = User(
            email=admin_email,
            password_hash=pwd_context.hash(admin_pass),
            first_name="Cozhaven",
            last_name="Admin",
            role="admin"
        )
        
        db.add(admin_user)
        db.commit()
        print(f"✅ Admin Account Re-Established!")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_pass}")
        print("-" * 30)
        print("Command: Store these credentials securely.")
        
    except Exception as e:
        db.rollback()
        print(f"Error recreating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    recreate_admin()
