#!/bin/bash

cleanup() {
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

echo "Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Setting up Backend..."
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "Installing backend dependencies..."
pip install -r backend/requirements.txt

echo "Starting Backend Server on port 8000..."
uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting Frontend Server..."
npm run dev -- --host &
FRONTEND_PID=$!

echo "Servers are running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"

wait $BACKEND_PID $FRONTEND_PID
