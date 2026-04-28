from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class SignupRequest(BaseModel):
    name:          str
    email:         EmailStr
    password:      str
    role:          str = "intern"
    internship_id: Optional[str] = None

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:            str
    name:          str
    email:         str
    role:          str
    internship_id: Optional[str]
    mentor_id:     Optional[str]
    is_active:     bool

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut

class UserCreate(BaseModel):
    name:          str
    email:         EmailStr
    password:      str
    role:          str = "intern"
    internship_id: Optional[str] = None

class UserUpdate(BaseModel):
    name:      Optional[str]  = None
    is_active: Optional[bool] = None

class InternshipCreate(BaseModel):
    title:       str
    duration:    Optional[str] = None
    description: Optional[str] = None
    mentor_id:   str

class InternshipUpdate(BaseModel):
    title:       Optional[str] = None
    duration:    Optional[str] = None
    description: Optional[str] = None
    mentor_id:   Optional[str] = None

class InternshipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:          str
    title:       str
    duration:    Optional[str]
    description: Optional[str]
    mentor_id:   Optional[str]

class TaskCreate(BaseModel):
    title:         str
    description:   Optional[str] = None
    deadline:      Optional[str] = None
    intern_id:     str
    internship_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title:       Optional[str] = None
    description: Optional[str] = None
    deadline:    Optional[str] = None
    status:      Optional[str] = None

class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:            str
    title:         str
    description:   Optional[str]
    deadline:      Optional[str]
    status:        str
    intern_id:     str
    internship_id: Optional[str]
    created_by:    Optional[str]

class ReportCreate(BaseModel):
    content: str

class FeedbackCreate(BaseModel):
    feedback: str

class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:           str
    intern_id:    str
    week_number:  int
    submitted_at: str
    content:      str
    feedback:     Optional[str]
    feedback_by:  Optional[str]

class InternProgress(BaseModel):
    intern_id:           str
    name:                str
    task_total:          int
    task_completed:      int
    task_completion_pct: float
    reports_submitted:   int
    pending_tasks:       int

class AnalyticsOut(BaseModel):
    interns:            list[InternProgress]
    overall_completion: float
    total_tasks:        int
    total_completed:    int
    total_reports:      int
