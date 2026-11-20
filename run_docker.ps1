Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting EduPulse AI (Docker Full Stack)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Auto-generate .env from template if missing
if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
    Copy-Item ".env.example" ".env"
    Write-Host "[INFO] Created root .env from .env.example template." -ForegroundColor Gray
}

if (-not (Test-Path "backend\.env") -and (Test-Path "backend\.env.example")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "[INFO] Created backend/.env from backend/.env.example template." -ForegroundColor Gray
}

# 2. Launch Docker Compose with automated build & dependency installation
Write-Host "[INFO] Building Docker images and installing dependencies..." -ForegroundColor Cyan
Write-Host "[INFO] Backend: Python 3.11 + pip requirements.txt + DB migrations + seed" -ForegroundColor Gray
Write-Host "[INFO] Student Portal: Node 20 + npm install + Nginx (Port 80)" -ForegroundColor Gray
Write-Host "[INFO] Teacher Portal: Node 20 + npm install + Nginx (Port 8080)" -ForegroundColor Gray
Write-Host ""

docker compose up --build -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n===================================================" -ForegroundColor Red
    Write-Host "[ERROR] Docker command failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common Fixes:" -ForegroundColor Yellow
    Write-Host " 1. Make sure Docker Desktop is OPEN and RUNNING." -ForegroundColor Yellow
    Write-Host " 2. If using Windows WSL2, check that WSL is updated." -ForegroundColor Yellow
    Write-Host " 3. Wait a few seconds for Docker daemon to finish booting." -ForegroundColor Yellow
    Write-Host "===================================================" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  All 3 EduPulse AI services are now running!" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "  - 👩‍🏫 Teacher Portal:   http://localhost:8080" -ForegroundColor Yellow
Write-Host "    Default Login:        teacher1 / Teacher@123" -ForegroundColor White
Write-Host "  - 🧑‍🎓 Student Web App:  http://localhost" -ForegroundColor Yellow
Write-Host "  - ⚙️  Unified Backend:   http://localhost:8000/api/academics/" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Tip: Run 'stop_docker.bat' or 'docker compose down' to stop all containers.`n" -ForegroundColor Gray
