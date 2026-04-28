import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, ForeignKey, Text, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


def gen_id():
    return str(uuid.uuid4())


class Internship(Base):
    __tablename__ = "internships"

    id:          Mapped[str]      = mapped_column(String(36), primary_key=True, default=gen_id)
    title:       Mapped[str]      = mapped_column(String(200), nullable=False)
    duration:    Mapped[str]      = mapped_column(String(80),  nullable=True)
    description: Mapped[str]      = mapped_column(Text,        nullable=True)
    mentor_id:   Mapped[str]      = mapped_column(String(36),  ForeignKey("users.id", use_alter=True), nullable=True)
    created_at:  Mapped[datetime] = mapped_column(default=datetime.utcnow)

    mentor  = relationship("User", foreign_keys=[mentor_id], back_populates="mentored_internships")
    interns = relationship("User", foreign_keys="User.internship_id", back_populates="internship")
    tasks   = relationship("Task", back_populates="internship")


class User(Base):
    __tablename__ = "users"

    id:            Mapped[str]  = mapped_column(String(36), primary_key=True, default=gen_id)
    name:          Mapped[str]  = mapped_column(String(120), nullable=False)
    email:         Mapped[str]  = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str]  = mapped_column(String(256), nullable=False)
    role:          Mapped[str]  = mapped_column(String(20),  default="intern")   # admin | mentor | intern
    internship_id: Mapped[str]  = mapped_column(String(36),  ForeignKey("internships.id"), nullable=True)
    mentor_id:     Mapped[str]  = mapped_column(String(36),  ForeignKey("users.id"),       nullable=True)
    is_active:     Mapped[bool] = mapped_column(Boolean, default=True)
    created_at:    Mapped[datetime] = mapped_column(default=datetime.utcnow)

    internship            = relationship("Internship", foreign_keys=[internship_id], back_populates="interns")
    mentor                = relationship("User", foreign_keys=[mentor_id], remote_side="User.id")
    mentored_internships  = relationship("Internship", foreign_keys="Internship.mentor_id", back_populates="mentor")
    assigned_tasks        = relationship("Task",   foreign_keys="Task.intern_id",   back_populates="intern")
    created_tasks         = relationship("Task",   foreign_keys="Task.created_by",  back_populates="creator")
    reports               = relationship("Report", foreign_keys="Report.intern_id", back_populates="intern")
    feedback_given        = relationship("Report", foreign_keys="Report.feedback_by", back_populates="reviewer")


class Task(Base):
    __tablename__ = "tasks"

    id:            Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_id)
    title:         Mapped[str] = mapped_column(String(200), nullable=False)
    description:   Mapped[str] = mapped_column(Text,        nullable=True)
    deadline:      Mapped[str] = mapped_column(String(20),  nullable=True)   # store as "YYYY-MM-DD"
    status:        Mapped[str] = mapped_column(String(20),  default="todo")  # todo | in-progress | completed
    intern_id:     Mapped[str] = mapped_column(String(36),  ForeignKey("users.id"), nullable=False)
    internship_id: Mapped[str] = mapped_column(String(36),  ForeignKey("internships.id"), nullable=True)
    created_by:    Mapped[str] = mapped_column(String(36),  ForeignKey("users.id"), nullable=True)
    created_at:    Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at:    Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

    intern     = relationship("User",        foreign_keys=[intern_id],    back_populates="assigned_tasks")
    creator    = relationship("User",        foreign_keys=[created_by],   back_populates="created_tasks")
    internship = relationship("Internship",  back_populates="tasks")


class Report(Base):
    __tablename__ = "reports"

    id:           Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_id)
    intern_id:    Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    week_number:  Mapped[int] = mapped_column(Integer,    nullable=False)
    submitted_at: Mapped[str] = mapped_column(String(20), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    content:      Mapped[str] = mapped_column(Text,       nullable=False)
    feedback:     Mapped[str] = mapped_column(Text,       nullable=True)
    feedback_by:  Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at:   Mapped[datetime] = mapped_column(default=datetime.utcnow)

    intern   = relationship("User", foreign_keys=[intern_id],   back_populates="reports")
    reviewer = relationship("User", foreign_keys=[feedback_by], back_populates="feedback_given")
