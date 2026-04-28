from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.models import User, Internship
from app.schemas.schemas import LoginRequest, SignupRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

def make_token(user: User) -> dict:
    return {
        "access_token": create_access_token({"sub": user.id, "role": user.role}),
        "token_type": "bearer",
        "user": UserOut.model_validate(user),
    }

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.is_active == True).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return make_token(user)

@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    mentor_id = None
    if body.internship_id:
        prog = db.query(Internship).filter(Internship.id == body.internship_id).first()
        if not prog:
            raise HTTPException(status_code=404, detail="Internship not found")
        mentor_id = prog.mentor_id
    user = User(
        name=body.name, email=body.email,
        password_hash=hash_password(body.password),
        role=body.role, internship_id=body.internship_id, mentor_id=mentor_id,
    )
    db.add(user); db.commit(); db.refresh(user)
    return make_token(user)
