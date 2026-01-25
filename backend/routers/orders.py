from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import stripe
import os
from .. import database, models, schemas, auth

# Try to load dotenv if available, otherwise rely on os.environ
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

stripe.api_key = os.getenv("STRIPE_API_KEY")

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)

@router.post("/checkout") # Returns URL or session ID
def create_checkout_session(order_req: schemas.OrderCreate, 
                            db: Session = Depends(database.get_db),
                            current_user: models.User = Depends(auth.get_current_active_user)):
    
    if not stripe.api_key:
        # Mock mode if no key (for development without Stripe)
        # In a real scenario, this should fail or use a specialized mock
        print("WARNING: Stripe API Key missing. Using Mock Mode.")
    
    line_items = []
    total_amount = 0.0
    db_order_items = []

    # Validate stock and calculate price
    for item in order_req.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
             raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
        
        total_amount += product.price * item.quantity
        db_order_items.append(models.OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price
        ))

        line_items.append({
            'price_data': {
                'currency': 'jpy',
                'product_data': {
                    'name': product.name,
                    # 'images': [product.image_url],
                },
                'unit_amount': int(product.price), # Stripe expects integer amounts in smallest currency unit? JPY is zero-decimal? 
                # JPY is zero-decimal. standard: no decimals.
            },
            'quantity': item.quantity,
        })

    # Create DB Order (Pending)
    new_order = models.Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Add items
    for db_item in db_order_items:
        db_item.order_id = new_order.id
        db.add(db_item)
    db.commit()

    if stripe.api_key:
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f"http://localhost:5175/orders/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={new_order.id}",
                cancel_url=f"http://localhost:5175/cart",
                client_reference_id=str(new_order.id),
                customer_email=current_user.email
            )
            # Save session id to order?
            new_order.stripe_payment_id = checkout_session.id
            db.commit()
            return {"checkout_url": checkout_session.url}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # Mock response
        # Return relative path so frontend handles the domain/port
        return {"checkout_url": f"/checkout?order_id={new_order.id}"}

@router.get("/verify")
def verify_order(session_id: str, order_id: int, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status == "paid":
        return {"status": "paid"} # Already processed

    # Verify with Stripe
    if stripe.api_key and session_id != "mock_session":
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            if session.payment_status == 'paid':
                order.status = "paid"
                # Reduce stock?
                # Ideally reduce stock when creating session or holding it. 
                # Simple implementation: Reduce here.
                for item in order.items:
                    item.product.stock -= item.quantity
                
                db.commit()
                
                # Mock Email
                print(f"Mock Email: Order {order.id} confirmed for {order.owner.email}. Total: {order.total_amount}")
                return {"status": "paid"}
            else:
                 return {"status": "unpaid"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # Mock verify
        order.status = "paid"
        for item in order.items:
             item.product.stock -= item.quantity
        db.commit()
        print(f"Mock Email: Order {order.id} confirmed for {order.owner.email}. Total: {order.total_amount}")
        return {"status": "paid"}

@router.get("/my-orders", response_model=List[schemas.OrderResponse])
def read_my_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user.orders
