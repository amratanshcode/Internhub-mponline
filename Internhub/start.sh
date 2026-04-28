#!/bin/bash
# ─────────────────────────────────────────────────
#  InternHub — One Click Start Script
#  Run: bash start.sh
# ─────────────────────────────────────────────────

echo ""
echo "🚀 Starting InternHub..."
echo ""

# ── Backend ──────────────────────────────────────
echo "📦 Setting up backend..."
cd backend

# Create virtualenv if not exists
if [ ! -d "venv" ]; then
  echo "   Creating virtual environment..."
  python3 -m venv venv
fi

# Activate
source venv/bin/activate

# Install dependencies
echo "   Installing Python packages..."
pip install -r requirements.txt -q

echo "   Starting FastAPI server on http://localhost:8000 ..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# ── Frontend ─────────────────────────────────────
echo ""
echo "🎨 Setting up frontend..."
cd frontend

echo "   Installing npm packages (first time takes ~1 min)..."
npm install --silent

echo "   Starting React app on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ InternHub is running!"
echo ""
echo "   🌐 App      → http://localhost:5173"
echo "   📖 API Docs → http://localhost:8000/docs"
echo ""
echo "   Demo Logins:"
echo "   🔑 Admin   → admin@hub.io   / admin123"
echo "   👨‍🏫 Mentor  → sarah@hub.io   / mentor123"
echo "   🎒 Intern  → priya@hub.io   / intern123"
echo ""
echo "   Press Ctrl+C to stop everything"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep running — kill both on Ctrl+C
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
