@echo off
title QuizMaster - Online Quiz Portal Launcher
echo ===================================================
echo   Starting QuizMaster Full-Stack Application...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "QuizMaster Backend" /min cmd /c "java -jar backend\target\online-quiz-system-backend-0.0.1-SNAPSHOT.jar"
timeout /t 6 /nobreak > nul

echo [2/3] Starting React Frontend (Port 5173)...
start "QuizMaster Frontend" /min cmd /c "cd frontend && npm.cmd run preview -- --host --port 5173"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Cloudflare Live Public Tunnel...
start "QuizMaster Public Link" cmd /k "cloudflared.exe tunnel --url http://localhost:5173"

echo.
echo ===================================================
echo   System is now LIVE!
echo.
echo   1. On your laptop: Open http://localhost:5173
echo   2. For mobile or friends: Look at the Cloudflare
echo      window for your active https://... link!
echo ===================================================
echo.
timeout /t 3 > nul
start http://localhost:5173
pause
