@echo off
cd /d "%~dp0server"
title Setup Jay Bhavani Admin
echo ========================================================
echo   Creating / Updating Admin Account
echo ========================================================
echo.
if not exist "node_modules" (
  echo Installing server dependencies first...
  call npm install
)
call npm run create-admin
echo.
pause
