@echo off
echo Starting EduPulse AI Unified Backend Server on Port 8000...
cd /d "%~dp0"

REM Check for python in Local AppData
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    "%LOCALAPPDATA%\Python\bin\python.exe" manage.py runserver 8000
    exit /b %errorlevel%
)

REM Fallback to py or python
py manage.py runserver 8000 2>nul || python manage.py runserver 8000
pause
