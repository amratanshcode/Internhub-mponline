from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.middleware.auth import get_current_user, require_mentor_admin
from app.models.models import Task, User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/", response_model=list[TaskOut])
def list_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(Task)
    if current_user.role == "intern":
        q = q.filter(Task.intern_id == current_user.id)
    elif current_user.role == "mentor":
        intern_ids = [u.id for u in db.query(User).filter(User.mentor_id == current_user.id).all()]
        q = q.filter(Task.intern_id.in_(intern_ids))
    return q.all()

@router.post("/", response_model=TaskOut, status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db),
                current_user: User = Depends(require_mentor_admin)):
    intern = db.query(User).filter(User.id == body.intern_id, User.role == "intern").first()
    if not intern:
        raise HTTPException(404, "Intern not found")
    if current_user.role == "mentor" and intern.mentor_id != current_user.id:
        raise HTTPException(403, "Not your intern")
    task = Task(**body.model_dump(), created_by=current_user.id)
    db.add(task); db.commit(); db.refresh(task)
    return task

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: str, body: TaskUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if current_user.role == "intern" and task.intern_id != current_user.id:
        raise HTTPException(403, "Not your task")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(task, k, v)
    db.commit(); db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str, db: Session = Depends(get_db),
                _: User = Depends(require_mentor_admin)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    db.delete(task); db.commit()
