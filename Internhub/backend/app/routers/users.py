from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.middleware.auth import get_current_user, require_admin, require_mentor_admin
from app.models.models import User, Internship
from app.schemas.schemas import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=list[UserOut])
def list_users(role: str = None, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    if current_user.role == "mentor":
        q = q.filter(User.mentor_id == current_user.id)
    return q.all()

@router.post("/", response_model=UserOut, status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db),
                _: User = Depends(require_admin)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    mentor_id = None
    if body.internship_id:
        prog = db.query(Internship).filter(Internship.id == body.internship_id).first()
        if prog:
            mentor_id = prog.mentor_id
    user = User(name=body.name, email=body.email,
                password_hash=hash_password(body.password),
                role=body.role, internship_id=body.internship_id, mentor_id=mentor_id)
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: str, body: UserUpdate, db: Session = Depends(get_db),
                _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    db.commit(); db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db),
                _: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user); db.commit()
