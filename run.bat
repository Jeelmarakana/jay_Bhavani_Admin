@echo off
setlocal enabledelayedexpansion

:: 0. Fix System PATH in case Windows System32 / nodejs is missing from PATH
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\node;%PATH%"

cd /d "%~dp0"
title Jay Bhavani Ornaments - System Launcher

echo =====================================================================
echo           JAY BHAVANI ORNAMENTS - SYSTEM STARTUP
echo =====================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is NOT detected on your computer!
  echo -----------------------------------------------------------------
  echo Please install Node.js (LTS Version):
  echo Download from: https://nodejs.org
  echo -----------------------------------------------------------------
  echo After installing Node.js, close this window and double click run.bat again.
  echo.
  pause
  exit /b 1
)

echo [OK] Node.js & npm detected:
node -v
call npm -v
echo.

:: 2. Setup Server .env
if not exist "server\.env" (
  echo [INFO] Creating server\.env configuration...
  copy "server\.env.example" "server\.env" >nul
  echo [OK] server\.env created.
)

:: 3. Server Dependencies
if not exist "server\node_modules" (
  echo [INFO] Installing Server dependencies (npm install)...
  cd /d "%~dp0server"
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install server dependencies.
    cd /d "%~dp0"
    pause
    exit /b 1
  )
  cd /d "%~dp0"
  echo [OK] Server dependencies installed.
) else (
  echo [OK] Server dependencies already installed.
)

:: 4. Client Dependencies
if not exist "client\node_modules" (
  echo.
  echo [INFO] Installing Client dependencies (npm install - takes 1-2 minutes)...
  cd /d "%~dp0client"
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install client dependencies.
    cd /d "%~dp0"
    pause
    exit /b 1
  )
  cd /d "%~dp0"
  echo [OK] Client dependencies installed.
) else (
  echo [OK] Client dependencies already installed.
)

:: 5. Create Admin Account (Best effort)
echo.
echo [INFO] Setting up Admin account...
cd /d "%~dp0server"
call npm run create-admin 2>nul
cd /d "%~dp0"

echo.
echo =====================================================================
echo   STARTING APPLICATION SERVERS:
echo   1. Backend API -> http://localhost:3000
echo   2. Angular Web -> http://localhost:4200
echo =====================================================================
echo.

start "Jay Bhavani - Server (API)" cmd /k "set ""PATH=C:\Windows\System32;C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"" && cd /d ""%~dp0server"" && npm run dev"
timeout /t 3 /nobreak >nul
start "Jay Bhavani - Client (Angular)" cmd /k "set ""PATH=C:\Windows\System32;C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"" && cd /d ""%~dp0client"" && npm start"

echo.
echo =====================================================================
echo   Both servers are starting in separate windows!
echo   Please wait ~30 seconds for Angular to finish building.
echo   Then open in Chrome:
echo   -> Website:     http://localhost:4200
echo   -> Admin Panel: http://localhost:4200/admin/login
echo =====================================================================
echo.
pause
