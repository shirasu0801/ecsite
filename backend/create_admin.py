import os

from backend import database, models, auth
from sqlalchemy.orm import Session

def create_admin():
    password = os.environ.get("ADMIN_PASSWORD")
    if not password or password == "admin":
        raise SystemExit("ADMIN_PASSWORD environment variable must be set to a strong password")

    db = database.SessionLocal()
    email = "admin@example.com"

    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print("Admin already exists")
        return

    hashed_password = auth.get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password, is_admin=True)
    db.add(new_user)
    db.commit()
    print("Admin user created: admin@example.com")
    db.close()

if __name__ == "__main__":
    create_admin()
