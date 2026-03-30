from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import PromoCode, Base

def seed_promo_codes():
    # Ensure tables are created (though migrations should have handled this)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(PromoCode).count() > 0:
        print("Promo codes already seeded.")
        db.close()
        return

    codes = [
        {"code": "WELCOME10", "type": "percent", "value": 10.0, "description": "10% Off"},
        {"code": "SAVE20", "type": "percent", "value": 20.0, "description": "20% Off"},
        {"code": "FREESHIP", "type": "shipping", "value": 0.0, "description": "Free Shipping"},
        {"code": "COZY50", "type": "fixed", "value": 50.0, "description": "$50 Off"},
    ]
    
    for c in codes:
        promo = PromoCode(
            code=c["code"],
            type=c["type"],
            value=c["value"],
            description=c["description"],
            is_active=1
        )
        db.add(promo)
    
    try:
        db.commit()
        print("Promo codes seeded successfully.")
    except Exception as e:
        print(f"Error seeding promo codes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_promo_codes()
