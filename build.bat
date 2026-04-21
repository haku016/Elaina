@echo off
:: ──────────────────────────────────────────────────────────────────────────
:: Elaina's Birthday – build .exe
:: Run this once to produce dist\ElainaBirthday\ElainaBirthday.exe
:: ──────────────────────────────────────────────────────────────────────────

cd /d "%~dp0"

:: Use the venv if it exists, otherwise fall back to system Python
if exist ".venv\Scripts\pip.exe" (
    set PIP=.venv\Scripts\pip.exe
    set PYINSTALLER=.venv\Scripts\pyinstaller.exe
) else (
    set PIP=pip
    set PYINSTALLER=pyinstaller
)

echo [1/3] Installing / upgrading build tools...
%PIP% install --quiet --upgrade pyinstaller pyinstaller-hooks-contrib python-dotenv Pillow

echo.
echo [2/3] Building executable (this may take 2-5 minutes)...
%PYINSTALLER% elaina.spec --clean --noconfirm

if errorlevel 1 (
    echo.
    echo BUILD FAILED. Check the output above for errors.
    pause
    exit /b 1
)

echo.
echo [3/3] Copying .env into the output folder...
if exist ".env" (
    copy /Y ".env" "dist\ElainaBirthday\.env" >nul
    echo     .env copied.
) else (
    echo     WARNING: .env not found – chat AI will not work until you add it.
)

echo.
echo ══════════════════════════════════════════════════════
echo  BUILD COMPLETE
echo  Executable:  dist\ElainaBirthday\ElainaBirthday.exe
echo.
echo  To use on another computer:
echo    1. Copy the entire dist\ElainaBirthday\ folder
echo    2. Edit .env inside that folder
echo    3. Add your Gemini API key  (https://aistudio.google.com/apikey)
echo    4. Double-click ElainaBirthday.exe
echo ══════════════════════════════════════════════════════
pause
