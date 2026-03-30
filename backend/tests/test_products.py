import os
import sys
from datetime import datetime, timedelta, timezone

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from auth import get_current_user
from database import Base, get_db
from main import app
from models import AdminApprovalRequest, Product, User, Variant, InventoryItem


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    admin_user = User(
        id=99,
        email="admin@example.com",
        password_hash="hashed",
        first_name="Admin",
        last_name="User",
        role="admin",
    )
    manager_user = User(
        id=100,
        email="manager@example.com",
        password_hash="hashed",
        first_name="Manager",
        last_name="User",
        role="manager",
    )
    prod = Product(
        id=1,
        name="Cozy Chair",
        slug="cozy-chair",
        product_type="simple",
        description="A very cozy chair",
        price=499.99,
        original_price=599.99,
        images="chair.jpg",
        category="chairs",
        subcategory="lounge-chairs",
        stock=5,
        colors="Red,Blue",
        sizes="M,L",
        badge="Sale",
        sale_percent=15,
        rating=4.8,
        reviews=120,
        specs="Material:Wood|Weight:15kg",
        status="active",
    )
    variant = Variant(
        id=10,
        product_id=1,
        title="Cozy Chair",
        sku="CH-00001",
        slug="cozy-chair",
        price=499.99,
        compare_at_price=599.99,
        status="active",
        position=1,
    )
    inventory_item = InventoryItem(variant_id=10, available_quantity=5, reorder_threshold=10, track_inventory=1)

    session.add_all([admin_user, manager_user, prod, variant, inventory_item])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def override_dependencies(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    def _override_current_user():
        return db_session.query(User).filter(User.id == 99).first()

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = _override_current_user
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def override_manager_dependencies(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    def _override_current_user():
        return db_session.query(User).filter(User.id == 100).first()

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[get_current_user] = _override_current_user
    yield
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_get_products(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) == 1
        assert data["products"][0]["id"] == 1
        assert data["products"][0]["name"] == "Cozy Chair"
        assert data["products"][0]["slug"] == "cozy-chair"
        assert data["products"][0]["sku"] == "CH-00001"
        assert data["products"][0]["originalPrice"] == 599.99


@pytest.mark.asyncio
async def test_get_product_by_id(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/products/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["name"] == "Cozy Chair"


@pytest.mark.asyncio
async def test_get_product_by_slug(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/products/cozy-chair")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["slug"] == "cozy-chair"


@pytest.mark.asyncio
async def test_get_admin_products(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/admin/products?page=1&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["sku"] == "CH-00001"
        assert data["items"][0]["slug"] == "cozy-chair"


@pytest.mark.asyncio
async def test_get_admin_product_detail(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/admin/products/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["slug"] == "cozy-chair"
        assert len(data["variants"]) == 1
        assert data["variants"][0]["sku"] == "CH-00001"


@pytest.mark.asyncio
async def test_get_inventory_workbench_items(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/admin/inventory/items?page=1&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["items"]) == 1
        assert data["items"][0]["variant_id"] == 10
        assert data["items"][0]["sku"] == "CH-00001"
        assert data["summary"]["tracked_items"] == 1
        assert data["summary"]["total_on_hand"] == 5
        assert data["summary"]["low_stock_count"] == 1


@pytest.mark.asyncio
async def test_get_product_not_found(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/products/999")
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_adjust_inventory_and_fetch_history(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        adjust_response = await ac.post(
            "/api/admin/products/1/inventory-adjustments",
            json={
                "variant_id": 10,
                "adjustment_type": "increase",
                "quantity": 3,
                "reason": "restock",
                "reference_type": "purchase_order",
                "reference_id": "PO-42",
                "reorder_threshold": 8,
            },
        )
        assert adjust_response.status_code == 200
        adjust_data = adjust_response.json()
        assert adjust_data["product_stock"] == 8
        assert adjust_data["variant"]["available_quantity"] == 8
        assert adjust_data["variant"]["reorder_threshold"] == 8
        assert adjust_data["adjustment"]["delta"] == 3
        assert adjust_data["adjustment"]["reason"] == "restock"

        history_response = await ac.get("/api/admin/products/1/inventory-history?limit=10")
        assert history_response.status_code == 200
        history_data = history_response.json()
        assert history_data["product_id"] == 1
        assert len(history_data["items"]) == 1
        assert history_data["items"][0]["variant_id"] == 10
        assert history_data["items"][0]["delta"] == 3

        audit_response = await ac.get("/api/admin/audit-logs?entity_types=inventory_item")
        assert audit_response.status_code == 200
        audit_data = audit_response.json()
        assert audit_data["total"] == 1
        assert audit_data["items"][0]["action"] == "inventory.adjusted"
        assert audit_data["items"][0]["performed_by_name"] == "Admin User"


@pytest.mark.asyncio
async def test_update_product_with_options_and_variant_links(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        update_response = await ac.put(
            "/api/admin/products/1",
            json={
                "product_type": "configurable",
                "options": [
                    {
                        "name": "Size",
                        "position": 1,
                        "values": [
                            {"value": "Small", "display_value": "Small", "position": 1},
                            {"value": "Large", "display_value": "Large", "position": 2},
                        ],
                    },
                    {
                        "name": "Color",
                        "position": 2,
                        "values": [
                            {"value": "Walnut", "display_value": "Walnut", "position": 1},
                        ],
                    },
                ],
                "variants": [
                    {
                        "id": 10,
                        "title": "Small / Walnut",
                        "sku": "CH-00001-SM-WAL",
                        "slug": "cozy-chair-small-walnut",
                        "price": 499.99,
                        "compare_at_price": 599.99,
                        "stock": 5,
                        "status": "active",
                        "position": 1,
                        "selected_options": [
                            {"option_name": "Size", "value": "Small", "display_value": "Small"},
                            {"option_name": "Color", "value": "Walnut", "display_value": "Walnut"},
                        ],
                    }
                ],
            },
        )
        assert update_response.status_code == 200

        detail_response = await ac.get("/api/admin/products/1")
        assert detail_response.status_code == 200
        detail_data = detail_response.json()
        assert detail_data["productType"] == "configurable"
        assert len(detail_data["options"]) == 2
        assert detail_data["options"][0]["name"] == "Size"
        assert detail_data["options"][0]["values"][0]["value"] == "Small"
        assert detail_data["variants"][0]["selectedOptions"][0]["optionName"] == "Size"
        assert detail_data["variants"][0]["selectedOptions"][1]["value"] == "Walnut"


@pytest.mark.asyncio
async def test_scheduled_pricing_updates_effective_product_price(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_response = await ac.post(
            "/api/admin/products/1/pricing-schedules",
            json={
                "label": "Launch Sale",
                "price": 449.99,
                "compare_at_price": 599.99,
                "starts_at": "2025-01-01T00:00:00Z",
                "ends_at": "2027-01-01T00:00:00Z",
                "is_active": True,
            },
        )
        assert create_response.status_code == 200
        schedule_data = create_response.json()
        assert schedule_data["price"] == 449.99
        assert schedule_data["active_now"] is True

        storefront_response = await ac.get("/api/products/1")
        assert storefront_response.status_code == 200
        storefront_data = storefront_response.json()
        assert storefront_data["price"] == 449.99
        assert storefront_data["basePrice"] == 499.99
        assert storefront_data["effectivePriceSource"] == "product_schedule"
        assert storefront_data["activeScheduleId"] == schedule_data["id"]
        assert storefront_data["scheduledPrices"][0]["activeNow"] is True

        admin_response = await ac.get("/api/admin/products/1")
        assert admin_response.status_code == 200
        admin_data = admin_response.json()
        assert admin_data["price"] == 449.99
        assert admin_data["scheduledPrices"][0]["id"] == schedule_data["id"]

        audit_response = await ac.get("/api/admin/audit-logs?entity_types=pricing_schedule")
        assert audit_response.status_code == 200
        audit_data = audit_response.json()
        assert audit_data["total"] == 1
        assert audit_data["items"][0]["entity_id"] == schedule_data["id"]
        assert audit_data["items"][0]["action"] == "pricing_schedule.created"


@pytest.mark.asyncio
async def test_promotion_admin_crud(override_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_response = await ac.post(
            "/api/admin/promotions",
            json={
                "code": "SPRING15",
                "type": "percent",
                "value": 15,
                "description": "Spring sale",
                "is_active": True,
                "expires_at": "2027-03-01T00:00:00Z",
            },
        )
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["code"] == "SPRING15"
        assert created["value"] == 15.0

        list_response = await ac.get("/api/admin/promotions")
        assert list_response.status_code == 200
        listed = list_response.json()
        assert len(listed) == 1
        assert listed[0]["code"] == "SPRING15"

        update_response = await ac.put(
            f"/api/admin/promotions/{created['id']}",
            json={
                "code": "SPRING20",
                "type": "fixed",
                "value": 20,
                "description": "Updated offer",
                "is_active": False,
                "expires_at": None,
            },
        )
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["code"] == "SPRING20"
        assert updated["type"] == "fixed"
        assert updated["value"] == 20.0
        assert updated["is_active"] is False

        delete_response = await ac.delete(f"/api/admin/promotions/{created['id']}")
        assert delete_response.status_code == 200

        final_list_response = await ac.get("/api/admin/promotions")
        assert final_list_response.status_code == 200
        assert final_list_response.json() == []

        audit_response = await ac.get("/api/admin/audit-logs?entity_types=promotion")
        assert audit_response.status_code == 200
        audit_data = audit_response.json()
        assert audit_data["total"] == 3
        assert [item["action"] for item in audit_data["items"]] == [
            "promotion.deleted",
            "promotion.updated",
            "promotion.created",
        ]


@pytest.mark.asyncio
async def test_manager_promotion_requires_approval_then_admin_approves(db_session, override_manager_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_response = await ac.post(
            "/api/admin/promotions",
            json={
                "code": "QUEUE15",
                "type": "percent",
                "value": 15,
                "description": "Queued promotion",
                "is_active": True,
                "expires_at": None,
            },
        )
        assert create_response.status_code == 200
        data = create_response.json()
        assert data["status"] == "pending_approval"
        approval_id = data["approval_request"]["id"]

        promo_list_response = await ac.get("/api/admin/promotions")
        assert promo_list_response.status_code == 200
        assert promo_list_response.json() == []

    def _override_current_user_admin():
        return db_session.query(User).filter(User.id == 99).first()

    app.dependency_overrides[get_current_user] = _override_current_user_admin

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        approve_response = await ac.post(
            f"/api/admin/approvals/{approval_id}/approve",
            json={"review_notes": "Approved for launch"},
        )
        assert approve_response.status_code == 200
        approved = approve_response.json()
        assert approved["status"] == "approved"
        assert approved["reviewed_by_name"] == "Admin User"

        promo_list_response = await ac.get("/api/admin/promotions")
        assert promo_list_response.status_code == 200
        promos = promo_list_response.json()
        assert len(promos) == 1
        assert promos[0]["code"] == "QUEUE15"


@pytest.mark.asyncio
async def test_manager_pricing_schedule_requires_approval_then_admin_approves(db_session, override_manager_dependencies):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        create_response = await ac.post(
            "/api/admin/products/1/pricing-schedules",
            json={
                "label": "Manager Requested Sale",
                "price": 425.0,
                "compare_at_price": 599.99,
                "starts_at": "2025-01-01T00:00:00Z",
                "ends_at": "2027-01-01T00:00:00Z",
                "is_active": True,
            },
        )
        assert create_response.status_code == 200
        data = create_response.json()
        assert data["status"] == "pending_approval"
        approval_id = data["approval_request"]["id"]

        storefront_response = await ac.get("/api/products/1")
        assert storefront_response.status_code == 200
        assert storefront_response.json()["price"] == 499.99

    def _override_current_user_admin():
        return db_session.query(User).filter(User.id == 99).first()

    app.dependency_overrides[get_current_user] = _override_current_user_admin

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        approve_response = await ac.post(
            f"/api/admin/approvals/{approval_id}/approve",
            json={"review_notes": "Approved sale window"},
        )
        assert approve_response.status_code == 200
        approved = approve_response.json()
        assert approved["status"] == "approved"

        storefront_response = await ac.get("/api/products/1")
        assert storefront_response.status_code == 200
        storefront = storefront_response.json()
        assert storefront["price"] == 425.0


@pytest.mark.asyncio
async def test_notifications_summary_and_stale_filter(override_dependencies, db_session):
    old_request = AdminApprovalRequest(
        entity_type="promotion",
        entity_id=None,
        action="promotion.created",
        summary="Old pending promo request",
        payload_json='{"code":"OLD15"}',
        status="pending",
        requested_by=100,
        created_at=datetime.now(timezone.utc) - timedelta(hours=30),
    )
    fresh_request = AdminApprovalRequest(
        entity_type="pricing_schedule",
        entity_id=None,
        action="pricing_schedule.created",
        summary="Fresh pending pricing request",
        payload_json='{"product_id":1,"price":425}',
        status="pending",
        requested_by=100,
        created_at=datetime.now(timezone.utc) - timedelta(hours=2),
    )
    db_session.add_all([old_request, fresh_request])
    db_session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        summary_response = await ac.get("/api/admin/notifications/summary")
        assert summary_response.status_code == 200
        summary = summary_response.json()
        assert summary["pending_count"] == 2
        assert summary["stale_count"] == 1
        assert summary["sla_hours"] == 24

        stale_response = await ac.get("/api/admin/approvals?status=pending&stale_only=true")
        assert stale_response.status_code == 200
        stale_data = stale_response.json()
        assert stale_data["total"] == 1
        assert stale_data["items"][0]["is_stale"] is True
        assert stale_data["items"][0]["summary"] == "Old pending promo request"
