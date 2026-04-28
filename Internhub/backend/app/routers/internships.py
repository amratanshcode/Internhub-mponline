from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_admin
from app.models.models import Internship, User
from app.schemas.schemas import InternshipCreate, InternshipUpdate, InternshipOut

router = APIRouter(prefix="/internships", tags=["internships"])

@router.get("/", response_model=list[InternshipOut])
def list_internships(db: Session = Depends(get_db),
                     _: User = Depends(get_current_user)):
    return db.query(Internship).all()

@router.post("/", response_model=InternshipOut, status_code=201)
def create_internship(body: InternshipCreate, db: Session = Depends(get_db),
                      _: User = Depends(require_admin)):
    prog = Internship(**body.model_dump())
    db.add(prog); db.commit(); db.refresh(prog)
    return prog

@router.patch("/{prog_id}", response_model=InternshipOut)
def update_internship(prog_id: str, body: InternshipUpdate,
                      db: Session = Depends(get_db), _: User = Depends(require_admin)):
    prog = db.query(Internship).filter(Internship.id == prog_id).first()
    if not prog:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(prog, k, v)
    db.commit(); db.refresh(prog)
    return prog

@router.delete("/{prog_id}", status_code=204)
def delete_internship(prog_id: str, db: Session = Depends(get_db),
                      _: User = Depends(require_admin)):
    prog = db.query(Internship).filter(Internship.id == prog_id).first()
    if not prog:
        raise HTTPException(404, "Not found")
    db.delete(prog); db.commit()
