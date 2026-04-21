@echo off
cd /d "%~dp0"
title Story Game Server

:: ── Pick Python from venv or system ─────────────────────────────────────────
if exist ".venv\Scripts\python.exe" (
    set PYTHON=.venv\Scripts\python.exe
    set PIP=.venv\Scripts\pip.exe
) else if exist "venv\Scripts\python.exe" (
    set PYTHON=venv\Scripts\python.exe
    set PIP=venv\Scripts\pip.exe
) else (
    set PYTHON=python
    set PIP=pip
)

:: ── Install / update dependencies ────────────────────────────────────────────
echo Installing dependencies...
%PIP% install --quiet flask flask-socketio simple-websocket

:: ── Launch server ─────────────────────────────────────────────────────────────
echo.
%PYTHON% game_server.py
pause
