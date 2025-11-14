@echo off
REM RRTS Setup Script for Windows
REM This script helps you set up the Road Repair and Tracking System

echo =========================================
echo   RRTS - Road Repair Tracking System
echo   Setup Script
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo + Node.js is installed
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo X npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo + npm is installed
npm --version

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo ! MongoDB not found. Please ensure MongoDB is installed and running.
    echo Visit: https://www.mongodb.com/try/download/community
)

echo.
echo =========================================
echo   Installing Dependencies
echo =========================================
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install backend dependencies
    pause
    exit /b 1
)
echo + Backend dependencies installed successfully

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo + .env file created. Please edit it with your configuration.
)

cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo X Failed to install frontend dependencies
    pause
    exit /b 1
)
echo + Frontend dependencies installed successfully

cd ..

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo Next steps:
echo.
echo 1. Start MongoDB:
echo    net start MongoDB
echo.
echo 2. Edit backend\.env file with your configuration
echo.
echo 3. Start the backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 4. Start the frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause
