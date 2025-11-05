@echo off
REM Setup script for Anonymous Messaging Platform (Windows)
REM This script automates the initial setup process

echo ============================================
echo Anonymous Messaging Platform - Setup Script
echo ============================================
echo.

echo Checking prerequisites...

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    exit /b 1
)
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)
echo [OK] Node.js found

REM Check PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL not found. You'll need to install it manually.
) else (
    echo [OK] PostgreSQL found
)

REM Check Redis
redis-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis not found. You'll need to install it manually.
) else (
    echo [OK] Redis found
)

echo.
echo Setting up backend...
echo ====================

cd backend

REM Create virtual environment
if not exist "venv" (
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [WARNING] Virtual environment already exists
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo [INFO] Installing Python dependencies (this may take a few minutes)...
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet
echo [OK] Python dependencies installed

REM Create .env file
if not exist ".env" (
    copy .env.example .env
    echo [OK] .env file created
    echo [WARNING] Please update .env with your database credentials
) else (
    echo [WARNING] .env file already exists
)

echo.
echo Setting up frontend...
echo ====================

cd ..\frontend

REM Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies (this may take a few minutes)...
    call npm install --silent
    echo [OK] npm dependencies installed
) else (
    echo [WARNING] node_modules already exists, skipping install
)

REM Create .env file
if not exist ".env" (
    copy .env.example .env
    echo [OK] .env file created
) else (
    echo [WARNING] .env file already exists
)

cd ..

echo.
echo ============================================
echo [OK] Setup complete!
echo.
echo Next steps:
echo 1. Update backend\.env with your configuration
echo 2. Create database: createdb anonymous_posts_db
echo 3. Run migrations: cd backend ^&^& venv\Scripts\activate ^&^& python manage.py migrate
echo 4. Create superuser: python manage.py createsuperuser
echo 5. Seed data: python manage.py seed_filtered_words
echo 6. Start Redis in a new terminal
echo 7. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& python manage.py runserver
echo 8. Start frontend: cd frontend ^&^& npm start
echo 9. Start Celery worker: cd backend ^&^& venv\Scripts\activate ^&^& celery -A config worker -l info
echo 10. Start Celery beat: cd backend ^&^& venv\Scripts\activate ^&^& celery -A config beat -l info
echo.
echo Access the application at: http://localhost:3000
echo Access the admin panel at: http://localhost:8000/admin
echo.
echo For more details, see QUICK_START.md
echo ============================================

pause
