@echo off
echo.
echo  Starting InternHub...
echo.

:: ── Backend ──────────────────────────────────
echo  Setting up backend...
cd backend

if not exist venv (
    echo    Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo    Installing Python packages...
pip install -r requirements.txt -q

echo    Starting backend on http://localhost:8000
start "InternHub Backend" cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

cd ..
timeout /t 4 /nobreak >nul

:: ── Frontend ─────────────────────────────────
echo.
echo  Setting up frontend...
cd frontend

echo    Installing npm packages...
call npm install --silent

echo    Starting frontend on http://localhost:5173
start "InternHub Frontend" cmd /k "npm run dev"

cd ..

echo.
echo  ════════════════════════════════════════════
echo   InternHub is running!
echo.
echo    App      - http://localhost:5173
echo    API Docs - http://localhost:8000/docs
echo.
echo    Admin  : admin@hub.io  / admin123
echo    Mentor : sarah@hub.io  / mentor123
echo    Intern : priya@hub.io  / intern123
echo  ════════════════════════════════════════════
echo.
pause
