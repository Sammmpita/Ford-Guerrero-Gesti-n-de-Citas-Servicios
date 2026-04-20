@echo off
chcp 65001 >nul
title Ford Guerrero - Iniciando proyecto...

set "BASE=%~dp0"
set "BACKEND=%BASE%backend"
set "FRONTEND=%BASE%frontend"
set "VENV=%BACKEND%\.venv\Scripts\activate.bat"

echo ============================================
echo    FORD GUERRERO - Arranque del proyecto
echo ============================================
echo.

:: ── Verificar entorno virtual ─────────────────────────────────────────────
if not exist "%VENV%" (
    echo [INFO] No se encontro el entorno virtual. Creandolo...
    cd /d "%BACKEND%"
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        echo         Asegurate de tener Python instalado y en el PATH.
        pause
        exit /b 1
    )
    echo [OK] Entorno virtual creado.
    echo.
    echo [INFO] Instalando dependencias del backend...
    call "%VENV%"
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas.
    echo.
)

:: ── Verificar node_modules ────────────────────────────────────────────────
if not exist "%FRONTEND%\node_modules" (
    echo [INFO] No se encontro node_modules. Instalando dependencias del frontend...
    cd /d "%FRONTEND%"
    npm install
    if errorlevel 1 (
        echo [ERROR] Fallo npm install.
        echo         Asegurate de tener Node.js instalado y en el PATH.
        pause
        exit /b 1
    )
    echo [OK] Dependencias del frontend instaladas.
    echo.
)

:: ── Aplicar migraciones ───────────────────────────────────────────────────
echo [INFO] Aplicando migraciones de Django...
cd /d "%BACKEND%"
call "%VENV%"
python manage.py migrate --run-syncdb
echo [OK] Migraciones aplicadas.
echo.

:: ── Lanzar Backend en ventana separada ───────────────────────────────────
echo [INFO] Iniciando servidor Django en http://127.0.0.1:8000 ...
start "Backend - Django" /d "%BACKEND%" cmd /k "call .venv\Scripts\activate.bat && python manage.py runserver"

:: ── Lanzar Frontend en ventana separada ──────────────────────────────────
echo [INFO] Iniciando servidor Vite en http://localhost:5173 ...
start "Frontend - Vite" /d "%FRONTEND%" cmd /k "npm run dev"

:: ── Esperar y abrir navegador ─────────────────────────────────────────────
echo.
echo [INFO] Abriendo navegador en 4 segundos...
timeout /t 4 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo ============================================
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo  Admin:    http://127.0.0.1:8000/admin/
echo ============================================
echo.
echo Cierra esta ventana cuando quieras. Los
echo servidores seguiran en sus propias ventanas.
echo.
pause
