import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from main import app
from database import get_db, Base
from models import Product, PromoCode
from routers.checkout import _calculate_order_total
from schemas import CheckoutItem

# Test database setup (SQLite in-memory)
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Seed a product
    prod = Product(
        id=1,
        name="Test Sofa",
        price=1000.0,
        original_price=1200.0,
        category="living-room",
        stock=10,
        status="active"
    )
    session.add(prod)
    
    # Seed promo codes
    codes = [
        PromoCode(code="WELCOME10", type="percent", value=10.0, description="10% Off", is_active=1),
        PromoCode(code="SAVE20", type="percent", value=20.0, description="20% Off", is_active=1),
        PromoCode(code="FREESHIP", type="shipping", value=0.0, description="Free Shipping", is_active=1),
        PromoCode(code="COZY50", type="fixed", value=50.0, description="$50 Off", is_active=1),
    ]
    for c in codes:
        session.add(c)
    
    session.commit()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def override_get_db(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = _override_get_db
    yield
    del app.dependency_overrides[get_db]

@pytest.mark.asyncio
async def test_calculate_checkout(db_session):
    items = [CheckoutItem(product_id=1, quantity=1)]
    
    # Test valid calculation
    calc = _calculate_order_total(items, "standard", "ON", None, db_session)
    
    assert calc["subtotal"] == 1000.0
    assert calc["shipping"] == 0.0 # Standard might be free over 1000
    # Tax in ON is 13%
    assert calc["tax_amount"] == 130.0
    assert calc["total"] == 1130.0

@pytest.mark.asyncio
async def test_promo_validation(override_get_db):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Valid code
        response = await ac.post("/api/validate-promo", json={"code": "WELCOME10", "subtotal": 1000.0})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["discount_amount"] == 100.0 # 10% of 1000
        
        # Invalid code
        response2 = await ac.post("/api/validate-promo", json={"code": "INVALIDXYZ", "subtotal": 1000.0})
        assert response2.status_code == 400

@pytest.mark.asyncio
async def test_payment_intent_creation(override_get_db, mocker):
    mocker.patch('stripe.PaymentIntent.create', return_value={
        "id": "pi_12345",
        "client_secret": "secret_12345"
    })
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req_data = {
            "items": [{"product_id": 1, "quantity": 1}],
            "shipping_method": "standard",
            "province": "ON",
            "email": "test@test.com",
            "shipping_address": {"city": "Toronto"}
        }
        
        response = await ac.post("/api/create-payment-intent", json=req_data)
        assert response.status_code == 200
        data = response.json()
        assert data["clientSecret"] == "secret_12345"
        assert data["paymentIntentId"] == "pi_12345"
        assert data["calculation"]["total"] == 1130.0
