from backend import database, models, auth
from sqlalchemy.orm import Session

def create_admin():
    db = database.SessionLocal()
    email = "admin@example.com"
    password = "admin"
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print("Admin already exists")
        return

    hashed_password = auth.get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_password, is_admin=True)
    db.add(new_user)
    db.commit()
    print("Admin user created: admin@example.com / admin")
    db.close()

if __name__ == "__main__":
    create_admin()
