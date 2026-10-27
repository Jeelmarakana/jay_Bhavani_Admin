@echo off
set "PATH=C:\Windows\System32;C:\Windows;C:\Windows\System32\WindowsPowerShell\v1.0;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\node;%PATH%"
cd /d "%~dp0client"
title Jay Bhavani - Angular Client
echo ===================================================
echo   Jay Bhavani Frontend Client (Port 4200)
echo ===================================================
echo.
if not exist "node_modules" (
  echo Installing client dependencies...
  call npm install
)
call npm start
pause
