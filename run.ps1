# PowerShell Launcher for Online Quiz Management System
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Online Quiz Management System (Full Stack)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Check MySQL
Write-Host "[1/3] Checking MySQL Service..." -ForegroundColor Yellow
$mysql = Get-Service -Name MySQL80 -ErrorAction SilentlyContinue
if ($mysql -and $mysql.Status -eq 'Running') {
    Write-Host "MySQL is running." -ForegroundColor Green
} else {
    Write-Host "Starting MySQL80 service..." -ForegroundColor Yellow
    Start-Service -Name MySQL80 -ErrorAction SilentlyContinue
}

# 2. Start Backend
Write-Host "[2/3] Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; java -jar target\online-quiz-system-backend-0.0.1-SNAPSHOT.jar"

# 3. Start Frontend
Write-Host "[3/3] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm.cmd run dev"

Start-Sleep -Seconds 3
Write-Host "Opening web browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Both servers launched successfully!" -ForegroundColor Green
Write-Host "Backend API:  http://localhost:8080/api" -ForegroundColor White
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
