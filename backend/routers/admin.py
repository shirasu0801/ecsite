from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(auth.get_current_admin_user)]
)

@router.get("/users", response_model=List[schemas.UserResponse])
def read_all_users(db: Session = Depends(database.get_db)):
    return db.query(models.User).all()

@router.get("/orders", response_model=List[schemas.OrderResponse])
def read_all_orders(db: Session = Depends(database.get_db)):
    return db.query(models.Order).all()
