@echo off
echo Starting Llama3 Medical Assistant...
echo.

REM Check if Ollama is running
echo Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Ollama is not running!
    echo Please start Ollama first:
    echo   1. Install Ollama from: https://ollama.ai/
    echo   2. Run: ollama serve
    echo   3. Run: ollama pull llama3:latest
    echo.
    pause
    exit /b 1
)

echo Ollama is running!
echo.

REM Start backend server
echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:8080 (or check terminal for actual port)
echo.
echo Press any key to exit...
pause >nul
