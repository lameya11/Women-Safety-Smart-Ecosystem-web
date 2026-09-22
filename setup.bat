@echo off
echo ==========================================
echo SafeGuard - Women Safety Smart Ecosystem
echo Quick Start Setup Script
echo ==========================================
echo.

REM Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

REM Setup Backend
echo.
echo [1/4] Installing backend dependencies...
cd backend
IF NOT EXIST .env (
    copy .env.example .env
    echo [OK] Created backend/.env from .env.example
    echo      IMPORTANT: Edit backend/.env and set JWT_SECRET
) ELSE (
    echo [OK] backend/.env already exists
)
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend npm install failed
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

REM Setup Frontend
echo.
echo [2/4] Installing frontend dependencies...
cd ..\frontend
IF NOT EXIST .env.local (
    copy .env.local.example .env.local
    echo [OK] Created frontend/.env.local
) ELSE (
    echo [OK] frontend/.env.local already exists
)
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install failed
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed

echo.
echo ==========================================
echo Setup complete! To start the application:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   npm run dev
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   npm start
echo.
echo The app will open at: http://localhost:3000
echo Demo account: demo@safeguard.app / demo123456
echo ==========================================
pause
