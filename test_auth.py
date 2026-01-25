import requests

BASE_URL = "http://127.0.0.1:8000"

def test_auth():
    # 1. Register
    email = "test_user_unique@example.com"
    password = "password123"
    
    print(f"Attempting to register {email}...")
    try:
        res = requests.post(f"{BASE_URL}/users/", json={"email": email, "password": password})
        print(f"Register Status: {res.status_code}")
        print(f"Register Response: {res.text}")
    except Exception as e:
        print(f"Register failed: {e}")

    # 2. Login (Admin)
    print("\nAttempting to login as admin...")
    try:
        # OAuth2PasswordRequestForm expects form data, not JSON
        data = {"username": "admin@example.com", "password": "admin"}
        res = requests.post(f"{BASE_URL}/login", data=data)
        print(f"Login Status: {res.status_code}")
        print(f"Login Response: {res.text}")
    except Exception as e:
        print(f"Login failed: {e}")

if __name__ == "__main__":
    test_auth()
