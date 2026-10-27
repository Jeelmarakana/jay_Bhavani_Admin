@echo off
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\node;%PATH%"
cd /d "%~dp0server"
title Jay Bhavani - Node.js Server
echo ===================================================
echo   Jay Bhavani Backend API (Port 3000)
echo ===================================================
echo.
if not exist "node_modules" (
  echo Installing server dependencies...
  call npm install
)
call npm run dev
pause
