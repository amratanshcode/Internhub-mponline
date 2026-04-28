from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.models import User, Task, Report
from app.schemas.schemas import AnalyticsOut, InternProgress

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/progress", response_model=AnalyticsOut)
def get_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == "intern":
        interns = [current_user]
    elif current_user.role == "mentor":
        interns = db.query(User).filter(User.mentor_id == current_user.id).all()
    else:
        interns = db.query(User).filter(User.role == "intern").all()

    progress_list, total_tasks, total_done, total_reports = [], 0, 0, 0

    for intern in interns:
        tasks      = db.query(Task).filter(Task.intern_id == intern.id).all()
        task_total = len(tasks)
        task_done  = len([t for t in tasks if t.status == "completed"])
        rep_count  = db.query(Report).filter(Report.intern_id == intern.id).count()
        pct        = round(task_done / task_total * 100, 1) if task_total else 0.0

        progress_list.append(InternProgress(
            intern_id=intern.id, name=intern.name,
            task_total=task_total, task_completed=task_done,
            task_completion_pct=pct, reports_submitted=rep_count,
            pending_tasks=task_total - task_done,
        ))
        total_tasks   += task_total
        total_done    += task_done
        total_reports += rep_count

    overall = round(total_done / total_tasks * 100, 1) if total_tasks else 0.0
    return AnalyticsOut(
        interns=progress_list, overall_completion=overall,
        total_tasks=total_tasks, total_completed=total_done, total_reports=total_reports,
    )
