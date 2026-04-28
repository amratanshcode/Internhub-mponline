from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_mentor_admin
from app.models.models import Report, User
from app.schemas.schemas import ReportCreate, FeedbackCreate, ReportOut

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Report)
    if current_user.role == "intern":
        q = q.filter(Report.intern_id == current_user.id)
    elif current_user.role == "mentor":
        intern_ids = [u.id for u in db.query(User).filter(User.mentor_id == current_user.id).all()]
        q = q.filter(Report.intern_id.in_(intern_ids))
    return q.order_by(Report.week_number).all()

@router.post("/", response_model=ReportOut, status_code=201)
def submit_report(body: ReportCreate, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    if current_user.role != "intern":
        raise HTTPException(403, "Only interns can submit reports")
    last = db.query(Report).filter(Report.intern_id == current_user.id).order_by(Report.week_number.desc()).first()
    week = (last.week_number + 1) if last else 1
    report = Report(intern_id=current_user.id, week_number=week, content=body.content)
    db.add(report); db.commit(); db.refresh(report)
    return report

@router.patch("/{report_id}/feedback", response_model=ReportOut)
def add_feedback(report_id: str, body: FeedbackCreate, db: Session = Depends(get_db),
                 current_user: User = Depends(require_mentor_admin)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    report.feedback = body.feedback
    report.feedback_by = current_user.id
    db.commit(); db.refresh(report)
    return report

@router.delete("/{report_id}", status_code=204)
def delete_report(report_id: str, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    if current_user.role == "intern" and report.intern_id != current_user.id:
        raise HTTPException(403, "Not your report")
    db.delete(report); db.commit()
