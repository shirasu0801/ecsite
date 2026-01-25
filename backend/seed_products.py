from backend import database, models
from sqlalchemy.orm import Session

def seed_products():
    db = database.SessionLocal()
    
    if db.query(models.Product).count() > 0:
        print("Products already seeded")
        return

    products = [
        models.Product(name="Luminous Foundation", description="Radiant finish for all skin types.", price=4500, stock=50, image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80"),
        models.Product(name="Velvet Lipstick", description="Long-lasting matte lipstick in ruby red.", price=3200, stock=100, image_url="https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&q=80"),
        models.Product(name="Hydrating Serum", description="Hyaluronic acid serum for deep hydration.", price=6800, stock=30, image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80"),
        models.Product(name="Volumizing Mascara", description="Intense black mascara for dramatic lashes.", price=2800, stock=80, image_url="https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400&q=80"),
        models.Product(name="Rose Gold Highlighter", description="Shimmering highlighter for a natural glow.", price=3800, stock=40, image_url="https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80"), # Duplicate image for placeholder
    ]

    for p in products:
        db.add(p)
    
    db.commit()
    print("Seeded 5 products")
    db.close()

if __name__ == "__main__":
    seed_products()
