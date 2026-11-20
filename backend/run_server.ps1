$pythonPath = "$env:LOCALAPPDATA\Python\bin\python.exe"

if (Test-Path $pythonPath) {
    Write-Host "Using Python at: $pythonPath" -ForegroundColor Cyan
    Set-Location -Path $PSScriptRoot
    & $pythonPath manage.py runserver 8000
} else {
    Set-Location -Path $PSScriptRoot
    python manage.py runserver 8000
}
