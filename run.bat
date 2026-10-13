@echo off
title Online Quiz Management System - Launcher
echo ==========================================================
echo Starting Online Quiz Management System (Full Stack)
echo ==========================================================

cd /d "%~dp0"

echo [1/3] Checking MySQL Service...
sc query MySQL80 | find "RUNNING" >nul
if %ERRORLEVEL% EQU 0 (
    echo MySQL is already running.
) else (
    echo Attempting to start MySQL80...
    net start MySQL80
)

echo [2/3] Starting Spring Boot Backend on http://localhost:8080...
start "Quiz Backend (Spring Boot)" cmd /k "cd backend && java -jar target\online-quiz-system-backend-0.0.1-SNAPSHOT.jar"

echo [3/3] Starting React Frontend on http://localhost:5173...
start "Quiz Frontend (Vite + React)" cmd /k "cd frontend && npm.cmd run dev"

timeout /t 3 >nul
echo Opening application in default web browser...
start http://localhost:5173

echo ==========================================================
echo Applications are launching!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo ==========================================================
pause
