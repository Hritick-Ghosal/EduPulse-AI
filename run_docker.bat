@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo   Starting EduPulse AI (Docker Full Stack)
echo ===================================================
echo.

:: 1. Auto-generate .env from template if missing
if not exist .env (
    if exist .env.example (
        echo [INFO] .env file not found. Creating from .env.example template...
        copy .env.example .env >nul
    )
)

if not exist backend\.env (
    if exist backend\.env.example (
        echo [INFO] backend\.env not found. Creating from backend\.env.example template...
        copy backend\.env.example backend\.env >nul
    )
)

:: 2. Launch Docker Compose with automated build & dependency installation
echo [INFO] Building Docker images and installing dependencies...
echo [INFO] Backend: Python 3.11 + pip requirements.txt + DB migrations + seed
echo [INFO] Student Portal: Node 20 + npm install + Nginx (Port 80)
echo [INFO] Teacher Portal: Node 20 + npm install + Nginx (Port 8080)
echo.

docker compose up --build -d
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo [ERROR] Docker command failed!
    echo.
    echo Common Fixes:
    echo  1. Make sure Docker Desktop is OPEN and RUNNING.
    echo  2. If using Windows WSL2, check that WSL is updated.
    echo  3. Wait a few seconds for Docker daemon to finish booting.
    echo ===================================================
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================================
echo   All 3 EduPulse AI services are now running!
echo ===================================================
echo   - 👩‍🏫 Teacher Portal:   http://localhost:8080
echo     Default Login:        teacher1 / Teacher@123
echo   - 🧑‍🎓 Student Web App:  http://localhost
echo   - ⚙️  Unified Backend:   http://localhost:8000/api/academics/
echo ===================================================
echo.
echo Tip: Run 'stop_docker.bat' or 'docker compose down' to stop all containers.
pause
