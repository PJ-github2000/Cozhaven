import pytest
import httpx

# The app is running on port 8000
BASE_URL = "http://localhost:8000"

@pytest.mark.asyncio
async def test_health_check():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_get_products():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert isinstance(data["products"], list)
        # Assuming database is seeded, we should have products
        assert len(data["products"]) > 0

@pytest.mark.asyncio
async def test_get_single_product():
    async with httpx.AsyncClient() as client:
        # First get the list to find a valid ID
        response_list = await client.get(f"{BASE_URL}/api/products")
        assert response_list.status_code == 200
        products = response_list.json()["products"]
        assert len(products) > 0
        product_id = products[0]["id"]

        # Now get the specific product
        response = await client.get(f"{BASE_URL}/api/products/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == product_id
        assert "name" in data

@pytest.mark.asyncio
async def test_get_product_not_found():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/products/999999")
        assert response.status_code == 404

@pytest.mark.asyncio
async def test_validate_promo_code():
    async with httpx.AsyncClient() as client:
        payload = {"code": "WELCOME10", "subtotal": 1000.0}
        response = await client.post(f"{BASE_URL}/api/validate-promo", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["discount_amount"] == 100.0 # 10% of 1000

@pytest.mark.asyncio
async def test_validate_invalid_promo_code():
    async with httpx.AsyncClient() as client:
        payload = {"code": "INVALID_CODE", "subtotal": 1000.0}
        response = await client.post(f"{BASE_URL}/api/validate-promo", json=payload)
        assert response.status_code == 400

@pytest.mark.asyncio
async def test_checkout_calculation():
    async with httpx.AsyncClient() as client:
        # First get 2 valid products
        response_list = await client.get(f"{BASE_URL}/api/products")
        products = response_list.json()["products"]
        assert len(products) >= 1
        
        p1 = products[0]
        
        payload = {
            "items": [
                {"product_id": p1["id"], "quantity": 1}
            ],
            "shipping_method": "standard",
            "province": "ON",
            "promo_code": "WELCOME10"
        }
        
        response = await client.post(f"{BASE_URL}/api/checkout/calculate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "subtotal" in data
        assert "tax_amount" in data
        assert data["subtotal"] == p1["price"]

if __name__ == "__main__":
    import asyncio
    async def run_tests():
        print("Running Health Check...")
        await test_health_check()
        print("Running Get Products...")
        await test_get_products()
        print("Running Get Single Product...")
        await test_get_single_product()
        print("Running Promo Code Validation...")
        await test_validate_promo_code()
        print("Running Checkout Calculation...")
        await test_checkout_calculation()
        print("All Live API Integration Tests Passed!")

    asyncio.run(run_tests())
