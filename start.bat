@echo off
REM BizMind AI - bulletproof one-shot starter (works from anywhere)
REM This will:
REM   1. Kill any stuck Node processes
REM   2. Create a node_modules junction at the workspace root so Vite can resolve deps
REM   3. Start the server (full API + React frontend on port 4000)
REM
REM Just double-click this file from File Explorer, OR run from bash:
REM   cmd //c start.bat
REM
REM Then open http://localhost:4000 in your browser.

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ============================================================
echo   BizMind AI - Starter
echo ============================================================
echo.

REM --- Step 1: kill any old node.exe processes from previous attempts ---
echo [1/4] Cleaning up old Node processes (if any)...
REM Find PID listening on port 4000 and kill it specifically (avoids killing user's other terminals).
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000" ^| findstr "LISTENING"') do (
  taskkill /PID %%a /F >nul 2>&1
  echo   killed PID %%a (was holding port 4000).
)
REM Fallback: kill any node processes that aren't this shell (kept narrow on purpose).
REM Comment out the next line if it interferes with your other Node tooling.
REM taskkill /IM node.exe /F >nul 2>&1
if "%errorlevel%"=="0" echo   port 4000 is now free.

REM Give Windows a moment to release the ports
timeout /t 2 /nobreak >nul

REM --- Step 2: verify .env exists ---
echo.
echo [2/4] Checking configuration...
if not exist "bizmind-server\.env" (
  echo   ERROR: bizmind-server\.env is missing!
  pause
  exit /b 1
)
echo   .env file: OK

REM --- Step 3: ensure node_modules junction at workspace root ---
REM Vite's root is the workspace root, but node_modules lives in bizmind-client/.
REM Without a node_modules next to index.html, Vite can't resolve react, react-dom, etc.
REM We create a directory junction that mirrors bizmind-client\node_modules to .\node_modules.
echo.
echo [3/4] Wiring up node_modules for Vite...
if exist "bizmind-client\node_modules" (
  if not exist "node_modules" (
    mklink /J node_modules "bizmind-client\node_modules" >nul 2>&1
    if exist "node_modules" (
      echo   node_modules junction created.
    ) else (
      echo   WARNING: could not create node_modules junction. Frontend may fail to bundle.
    )
  ) else (
    echo   node_modules already exists at root.
  )
) else (
  echo   WARNING: bizmind-client\node_modules missing. Run "npm install" in bizmind-client first.
)

REM --- Step 4: start the full-stack server ---
echo.
echo [4/4] Starting BizMind AI on http://localhost:4000
echo   The React app AND API will both be available at this URL.
echo   Press Ctrl+C to stop.
echo.

cd bizmind-server
node server.js

endlocal