#  InternHub — MP online internship project 


Remote Internship Progress Dashboard is an internal tool designed for mentors to track student tasks and weekly reports. It includes features like markdown-based report submission, a task kanban board, and a mentor feedback section. The tech focus will be on React (react-kanban) for the frontend and Python for backend progress analytics.

## ✅ What you need (install these first)
- **Python 3.11+** → https://python.org/downloads
- **Node.js 18+**  → https://nodejs.org (LTS version)

That's it! No database setup needed — uses SQLite (just a file).

---

## ▶️ Run the project

### Mac / Linux
```bash
bash start.sh
```

### Windows
Double-click `start.bat`

### Or manually (any OS):

**Terminal 1 — Backend:**
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

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Open in browser
```
http://localhost:5173
```

## 🔑 Demo Logins
| Role   | Email           | Password   |
|--------|-----------------|------------|
| Admin  | admin@hub.io    | admin123   |
| Mentor | sarah@hub.io    | mentor123  |
| Intern | priya@hub.io    | intern123  |

---

## 📁 Project Structure
```
internhub/
├── start.sh / start.bat    ← One-click start
├── backend/
│   ├── app/
│   │   ├── main.py         ← FastAPI app + auto DB setup
│   │   ├── core/           ← config, database, security
│   │   ├── models/         ← SQLite tables
│   │   ├── routers/        ← API endpoints
│   │   └── schemas/        ← Request/response types
│   ├── internhub.db        ← SQLite DB (auto-created!)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx          ← Router
    │   ├── api/client.js    ← API calls
    │   ├── context/         ← Auth state
    │   ├── components/      ← UI components
    │   └── pages/           ← All pages
    └── package.json
```

##  Common Issues

**`python3` not found on Windows?**
Use `python` instead of `python3`

**Port already in use?**
```bash
# Change port:
uvicorn app.main:app --reload --port 8001
# Then update frontend/src/api/client.js → baseURL to http://localhost:8001
```

**npm install slow?**
Normal on first run, wait ~2 mins

**Backend error on start?**
Make sure you're inside the `backend/` folder and venv is activated
