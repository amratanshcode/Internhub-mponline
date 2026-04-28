InternHub - MP Online Internship Project

Overview

Internhub is a Remote Internship Progress Dashboard designed as an internal tool for mentors to track student tasks and weekly reports. It includes features like markdown-based report submission, a task kanban board, and a mentor feedback section. The tech focus is on React (react-kanban) for the frontend and Python for backend progress analytics.

Key Goals

- Track intern progress efficiently
- Organize task management with kanban boards
- Enable structured weekly report submission
- Provide mentors with comprehensive feedback capabilities
- Support role-based access control for Admin, Mentor, and Intern

Tech Stack

Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite (auto-created database)

Frontend
- React with react-kanban
- JavaScript
- CSS

Project Structure

```
internhub/
├── start.sh / start.bat        One-click start
├── backend/
│   ├── app/
│   │   ├── main.py             FastAPI app + auto DB setup
│   │   ├── core/               config, database, security
│   │   ├── models/             SQLite tables (User, Task, Report, etc.)
│   │   ├── routers/            API endpoints
│   │   ├── schemas/            Request/response validation
│   │   └── services/           Business logic layer
│   ├── requirements.txt        Python dependencies
│   └── internhub.db            SQLite DB (auto-created)
├── frontend/
│   ├── public/                 Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── DashboardNavbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TaskBoard.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js          Centralized API calls
│   │   ├── App.js              Router configuration
│   │   ├── index.js
│   │   ├── index.css
│   │   └── Login.css
│   ├── package.json
│   └── public/index.html
```

Architecture

Architecture Type: Modular Monolith
Design Pattern: Layered Architecture

Application Flow

Frontend (React UI) -> API Calls (HTTP/JSON) -> FastAPI Backend -> Service Layer (Business Logic) -> Database (SQLAlchemy ORM) -> Response -> Frontend Rendering

Features & Modules

Authentication
- User Registration
- User Login
- Password Hashing
- Role-based access (Admin, Mentor, Intern)

Task Management
- Create tasks
- View kanban board
- Update task status
- Delete tasks
- Assign tasks to interns

Report Submission
- Markdown-based weekly reports
- Submit reports
- View submitted reports
- Update reports

Dashboard
- Centralized user interface
- Task overview
- Report tracking
- Mentor feedback section

Feedback Module
- Add feedback to reports
- Track feedback history
- Notification system

Frontend Architecture

Pages
- Login.jsx: User authentication interface
- Register.jsx: New user registration
- Dashboard.jsx: Main user interface with overview
- TaskBoard.jsx: Kanban board for task management
- Reports.jsx: Weekly report submission and tracking

Components
- Navbar.jsx: General navigation across application
- DashboardNavbar.jsx: Dashboard-specific navigation with logout and profile options

Services
- api.js: Centralized HTTP request handler for all API communication

Backend Architecture

Authentication (routers/auth.py)
- User registration endpoint
- Login endpoint
- Password hashing and security

Task Module (routers/task.py)
- Create, read, update, delete tasks
- Task assignment management
- Task status tracking

Report Module (routers/report.py)
- Submit weekly reports
- Retrieve reports
- Update report content

Feedback Module (routers/feedback.py)
- Add feedback to reports
- Retrieve feedback history

Models
- User: User profiles and credentials
- Task: Task definitions and assignments
- Report: Weekly report submissions
- Feedback: Mentor feedback on reports

Schemas
- Input validation using Pydantic
- Response formatting and serialization

Application Flow

Authentication Flow
- User enters credentials on Login.jsx
- API call to /api/auth/login endpoint
- Backend validates user credentials
- JWT token or session response returned
- Token stored in frontend localStorage
- User redirected to Dashboard

Task Management Flow
- Mentor creates task via TaskBoard.jsx
- API request to /api/tasks POST endpoint
- Backend processes and stores task
- Task assigned to specific intern
- Intern views assigned task on dashboard
- Status updates trigger notifications

Report Submission Flow
- Intern navigates to Reports page
- Writes markdown-formatted weekly report
- Submits report via /api/reports POST
- Backend stores report with timestamp
- Mentor receives notification
- Mentor provides feedback on report
- Intern views feedback and responds

API Endpoints

Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout

Tasks
- POST /api/tasks - Create new task
- GET /api/tasks - Retrieve all tasks
- GET /api/tasks/{id} - Get specific task
- PUT /api/tasks/{id} - Update task
- DELETE /api/tasks/{id} - Delete task

Reports
- POST /api/reports - Submit weekly report
- GET /api/reports - Retrieve all reports
- GET /api/reports/{id} - Get specific report
- PUT /api/reports/{id} - Update report

Feedback
- POST /api/feedback - Add feedback to report
- GET /api/feedback/{report_id} - Get feedback for report
- DELETE /api/feedback/{id} - Delete feedback

Installation & Setup

Prerequisites

- Python 3.11+ from https://python.org/downloads
- Node.js 18+ (LTS version) from https://nodejs.org
- No database setup needed - SQLite is auto-created

Quick Start

Mac / Linux:
```bash
bash start.sh
```

Windows:
Double-click start.bat

Manual Setup (Any OS):

Terminal 1 - Backend:
```bash
cd backend
python -m venv venv

# Mac/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

Access the Application

Open browser and navigate to http://localhost:5173

Demo Credentials:

Role     | Email           | Password
---------|-----------------|----------
Admin    | admin@hub.io    | admin123
Mentor   | sarah@hub.io    | mentor123
Intern   | priya@hub.io    | intern123

Troubleshooting

python3 not found on Windows?
Use python instead of python3

Port already in use?
```bash
# Change backend port:
uvicorn app.main:app --reload --port 8001

# Then update frontend/src/services/api.js to use http://localhost:8001
```

npm install is slow?
This is normal on first run, may take 2-3 minutes

Backend error on startup?
Ensure you're in the backend/ directory and virtual environment is activated

Testing

Frontend
- Jest for unit testing
- React Testing Library for component testing

Backend
- Pytest for unit and integration testing
- Recommended for API endpoint testing

Code Quality

Strengths
- Clear separation of frontend and backend
- Modular backend structure with layered architecture
- Component-based frontend design
- Role-based access control
- Centralized API service

Areas for Improvement
- Comprehensive test coverage
- Enhanced error handling
- Input validation on frontend
- Loading states and error boundaries

Security

Current Implementation
- Password hashing for user authentication
- Role-based access control
- Pydantic validation for request/response

Recommended Improvements
- JWT-based authentication middleware
- CORS configuration for API endpoints
- Frontend input validation
- Rate limiting on API routes
- HTTPS in production
- SQL injection prevention in queries

Performance

Current Limitations
- No caching mechanism
- Synchronous database operations
- No pagination for large datasets

Optimization Recommendations
- Implement async database queries
- Add pagination for tasks and reports
- Cache frequently accessed data
- Optimize frontend component rendering
- Database indexing on frequently queried fields
- Lazy loading for large reports

Development Workflow

Current Setup
- Manual development and testing

Recommended Improvements
- GitHub Actions for CI/CD pipeline
- Automated linting (ESLint, Pylint)
- Automated testing on pull requests
- Code coverage tracking
- Pre-commit hooks for code quality

Future Enhancements

Backend
- Advanced permission system (Role-based access control)
- Email notifications for task assignments
- Report analytics and statistics
- Batch operations for task management
- File upload support for attachments
- Real-time updates using WebSockets

Frontend
- State management using Redux or Context API
- Interactive charts for report analytics
- Real-time notifications
- Dark mode support
- Mobile responsive design
- Calendar view for deadlines
- Search and filter functionality

System
- Comprehensive logging system
- Error handling middleware
- Audit trail for report modifications
- Database backup system
- Performance monitoring
- API documentation with Swagger

Project Demonstration

This project demonstrates an end-to-end workflow for internship management, from user authentication to task tracking and report submission. The modular architecture allows for easy expansion and integration of new features.

Key Capabilities:
- Complete user authentication system
- Task management with kanban board interface
- Markdown-based report submission
- Structured feedback mechanism
- Role-based access control
- Scalable architecture for future enhancements

Getting Started

1. Clone the repository
2. Follow the Quick Start section above
3. Login with demo credentials
4. Explore the task board and report features
5. Test the feedback submission system

Support and Contribution

For issues, suggestions, or contributions, please follow the standard GitHub workflow:
1. Create an issue describing the problem or feature request
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request with detailed description