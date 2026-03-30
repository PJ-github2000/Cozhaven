import urllib.request
import json
import sys

def test_admin_api():
    try:
        # 1. Login
        login_url = "http://localhost:8000/api/auth/login"
        login_data = json.dumps({
            "email": "admin@cozhaven.com",
            "password": "cozhaven2026"
        }).encode('utf-8')
        
        login_req = urllib.request.Request(
            login_url, 
            data=login_data, 
            headers={"Content-Type": "application/json"}
        )
        
        print("Authenticating as admin@cozhaven.com...")
        sys.stdout.flush()
        login_res = urllib.request.urlopen(login_req, timeout=5)
        login_data = json.loads(login_res.read().decode())
        
        # Get the cookie from the response headers
        cookie_header = login_res.getheader('Set-Cookie')
        print(f"✅ Login successful.")
        print(f"Cookie Header received: {'Yes' if cookie_header else 'No'}")
        
        if not cookie_header:
            print("No cookie received, cannot proceed.")
            return
            
        cookie = cookie_header.split(';')[0]
        sys.stdout.flush()
        
        # 2. Test /admin/users
        print("\nTesting GET /api/admin/users...")
        sys.stdout.flush()
        
        admin_url = "http://localhost:8000/api/admin/users"
        admin_req = urllib.request.Request(
            admin_url, 
            headers={"Cookie": cookie}
        )
        
        admin_res = urllib.request.urlopen(admin_req, timeout=5)
        users = json.loads(admin_res.read().decode())
        print(f"✅ Endpoint exists! Received {len(users)} users.")
        for u in users[:3]:
            print(f" - {u['first_name']} {u['last_name']} ({u['email']}) - Role: {u['role']}")
            
        sys.stdout.flush()
            
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code} - {e.reason}")
        error_body = e.read().decode()
        print(f"Details: {error_body}")
    except Exception as e:
        print(f"❌ Error: {e}")
        
if __name__ == "__main__":
    test_admin_api()
