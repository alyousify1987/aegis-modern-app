@echo off
title Aegis Audit Platform
echo ====================================
echo    AEGIS AUDIT PLATFORM STARTUP
echo ====================================
echo.
echo Checking dependencies (one-time)...
if not exist "%~dp0node_modules\" (
	echo Installing root packages...
	pushd "%~dp0"
	call npm install --silent
	popd
)
if not exist "%~dp0node_modules\.bin\concurrently.cmd" (
	echo Installing dev tools...
	pushd "%~dp0"
	call npm install --silent
	popd
)
if not exist "%~dp0server\node_modules\" (
	echo Installing backend packages...
	pushd "%~dp0server"
	call npm install --silent
	popd
)
echo 1) Web (browser) - starts backend + Vite and opens http://localhost:5173
echo 2) Desktop (Tauri) - starts backend + desktop window
set /p choice=Select 1 or 2 then press ENTER: 
if "%choice%"=="2" goto desktop

:: Default: Web
echo Starting Aegis (web)...
start "Aegis Web Dev" cmd /k "cd /d C:\Users\alyou\aegis-app && npm run dev:all"
timeout /t 3 /nobreak >nul
start http://localhost:5173
goto end

:desktop
echo Starting Aegis (desktop)...
start "Aegis Desktop" cmd /k "cd /d C:\Users\alyou\aegis-app && npm run dev:tauri"
goto end

:end
echo.
echo Login: admin@aegisaudit.com / admin123
echo This window can be closed.
