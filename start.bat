@echo off
echo ========================================
echo     Starting FitMind AI Platform
echo ========================================
echo.

echo [1/2] Starting Python Backend (port 5000)...
start "FitMind Backend" cmd /k "cd /d %~dp0backend && python fitbackend.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend (port 5173)...
start "FitMind Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo  Both servers are starting!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo ========================================
echo.
pause
