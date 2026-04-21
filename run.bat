@echo off
:: ──────────────────────────────────────────────
:: Elaina's Birthday – launcher
:: Double-click this file to start the app.
:: ──────────────────────────────────────────────

cd /d "%~dp0"

:: Use venv python if present, fall back to system python
if exist ".venv\Scripts\python.exe" (
    set PYTHON=.venv\Scripts\python.exe
    set PIP=.venv\Scripts\pip.exe
) else (
    set PYTHON=python
    set PIP=pip
)

echo Checking dependencies...
%PIP% show PyQt6 >nul 2>&1 || (
    echo Installing Python packages...
    %PIP% install -r requirements.txt
)

echo Starting Elaina's Birthday app...
%PYTHON% app.py
pause
