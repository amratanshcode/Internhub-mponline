from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.routers import auth, users, internships, tasks, reports, analytics

app = FastAPI(title="InternHub API", version="1.0.0", docs_url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(internships.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(analytics.router)


def seed_demo_data():
    """Auto-seed demo users on first run — only if DB is empty."""
    from app.models.models import User, Internship, Task, Report
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return  # already seeded

        print("🌱 Seeding demo data...")
        # Users
        admin = User(id="u1", name="Admin User", email="admin@hub.io", password_hash=hash_password("admin123"), role="admin")
        sarah  = User(id="u2", name="Sarah Chen",   email="sarah@hub.io",  password_hash=hash_password("mentor123"), role="mentor")
        james  = User(id="u3", name="James Okafor", email="james@hub.io",  password_hash=hash_password("mentor123"), role="mentor")
        db.add_all([admin, sarah, james]); db.commit()

        # Internships
        fe  = Internship(id="i1", title="Frontend Engineering", duration="3 months",
                         description="React, TypeScript, Design Systems", mentor_id="u2")
        ds  = Internship(id="i2", title="Data Science",         duration="4 months",
                         description="Python, ML, Statistical Analysis",  mentor_id="u3")
        db.add_all([fe, ds]); db.commit()

        # Interns
        priya = User(id="u4", name="Priya Sharma", email="priya@hub.io", password_hash=hash_password("intern123"), role="intern", internship_id="i1", mentor_id="u2")
        leo   = User(id="u5", name="Leo Martinez", email="leo@hub.io",   password_hash=hash_password("intern123"), role="intern", internship_id="i1", mentor_id="u2")
        aisha = User(id="u6", name="Aisha Nwosu",  email="aisha@hub.io", password_hash=hash_password("intern123"), role="intern", internship_id="i2", mentor_id="u3")
        db.add_all([priya, leo, aisha]); db.commit()

        # Tasks
        db.add_all([
            Task(title="Build auth module",        description="JWT login/logout flow",          deadline="2025-05-10", status="completed",   intern_id="u4", internship_id="i1", created_by="u2"),
            Task(title="Design component library", description="Buttons, inputs, cards",         deadline="2025-05-17", status="in-progress", intern_id="u4", internship_id="i1", created_by="u2"),
            Task(title="Write unit tests",         description="Jest + RTL coverage >80%",       deadline="2025-05-24", status="todo",        intern_id="u4", internship_id="i1", created_by="u2"),
            Task(title="API integration",          description="Connect to REST endpoints",      deadline="2025-05-20", status="todo",        intern_id="u4", internship_id="i1", created_by="u2"),
            Task(title="Dashboard prototype",      description="Figma to React implementation",  deadline="2025-05-15", status="completed",   intern_id="u5", internship_id="i1", created_by="u2"),
            Task(title="Accessibility audit",      description="WCAG 2.1 compliance",            deadline="2025-05-28", status="in-progress", intern_id="u5", internship_id="i1", created_by="u2"),
            Task(title="EDA on dataset",           description="Exploratory analysis notebook",  deadline="2025-05-12", status="completed",   intern_id="u6", internship_id="i2", created_by="u3"),
            Task(title="Feature engineering",      description="Transform and encode features",  deadline="2025-05-19", status="in-progress", intern_id="u6", internship_id="i2", created_by="u3"),
            Task(title="Train baseline model",     description="Logistic regression + eval",     deadline="2025-05-26", status="todo",        intern_id="u6", internship_id="i2", created_by="u3"),
        ]); db.commit()

        # Reports
        db.add_all([
            Report(intern_id="u4", week_number=1, submitted_at="2025-04-07", content="## Week 1\n\nCompleted auth module with JWT.\n\n**Blockers:** None\n\n**Next week:** Component library", feedback="Great work on JWT!", feedback_by="u2"),
            Report(intern_id="u4", week_number=2, submitted_at="2025-04-14", content="## Week 2\n\nBuilt Button, Input, Card components.\n\n**Blockers:** Storybook setup\n\n**Next week:** Form components", feedback="", feedback_by=None),
            Report(intern_id="u5", week_number=1, submitted_at="2025-04-07", content="## Week 1\n\nDashboard prototype done!\n\n**Blockers:** Responsive breakpoints\n\n**Next week:** Accessibility audit", feedback="Clean implementation!", feedback_by="u2"),
            Report(intern_id="u6", week_number=1, submitted_at="2025-04-07", content="## Week 1\n\nEDA complete. 50k rows, 23 features.\n\n**Blockers:** Missing data strategy\n\n**Next week:** Feature engineering", feedback="Use median imputation for numerics.", feedback_by="u3"),
        ]); db.commit()

        print("✅ Demo data seeded! Login: admin@hub.io / admin123")
    finally:
        db.close()


@app.on_event("startup")
def startup():
    # Create all tables automatically
    Base.metadata.create_all(bind=engine)
    # Seed demo data on first run
    seed_demo_data()

@app.get("/")
def read_root():
    return {"message": "Server is running!"}

@app.get("/")
def root():
    return {"message": "Internhub API is working!"}
