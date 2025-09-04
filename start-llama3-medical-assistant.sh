#!/bin/bash

echo "Starting Llama3 Medical Assistant..."
echo

# Check if Ollama is running
echo "Checking if Ollama is running..."
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo
    echo "ERROR: Ollama is not running!"
    echo "Please start Ollama first:"
    echo "  1. Install Ollama from: https://ollama.ai/"
    echo "  2. Run: ollama serve"
    echo "  3. Run: ollama pull llama3:latest"
    echo
    exit 1
fi

echo "Ollama is running!"
echo

# Start backend server in background
echo "Starting backend server..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:8080 (or check terminal for actual port)"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
