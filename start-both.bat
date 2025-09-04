@echo off
echo Starting Med-Fused-Mind servers...
echo.

echo Starting Ollama service...
start /B ollama serve

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting backend server...
start /B cmd /c "cd server && npm run dev"

echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo Starting frontend server...
start /B cmd /c "npm run dev"

echo Waiting 8 seconds for servers to fully start...
timeout /t 8 /nobreak >nul

echo Opening medical assistant...
start http://localhost:8080/medical-assistant

echo.
echo All services started!
echo Frontend: http://localhost:8080
echo Backend: http://localhost:4000
echo Ollama: http://localhost:11434
pause
