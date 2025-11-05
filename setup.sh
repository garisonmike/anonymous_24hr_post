#!/bin/bash

# Setup script for Anonymous Messaging Platform
# This script automates the initial setup process

set -e

echo "🚀 Anonymous Messaging Platform - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
    print_success "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found. Please install Python 3.10+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | cut -d ' ' -f 3)
    print_success "PostgreSQL found: $PSQL_VERSION"
else
    print_warning "PostgreSQL not found. You'll need to install it manually."
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    print_success "Redis found"
else
    print_warning "Redis not found. You'll need to install it manually."
fi

echo ""
echo "Setting up backend..."
echo "===================="

# Backend setup
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
print_warning "Installing Python dependencies (this may take a few minutes)..."
pip install -q --upgrade pip
pip install -q -r requirements.txt
print_success "Python dependencies installed"

# Create .env file
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success ".env file created"
    print_warning "Please update .env with your database credentials"
else
    print_warning ".env file already exists"
fi

# Ask for database setup
echo ""
read -p "Do you want to create the database now? (requires PostgreSQL) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database name [anonymous_posts_db]: " DB_NAME
    DB_NAME=${DB_NAME:-anonymous_posts_db}
    
    read -p "Enter PostgreSQL username [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    # Create database
    createdb -U $DB_USER $DB_NAME 2>/dev/null || print_warning "Database may already exist"
    print_success "Database setup complete"
    
    # Run migrations
    print_warning "Running migrations..."
    python manage.py migrate
    print_success "Migrations complete"
    
    # Create superuser
    read -p "Create superuser account? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python manage.py createsuperuser
    fi
    
    # Seed filtered words
    python manage.py seed_filtered_words
    print_success "Filtered words seeded"
else
    print_warning "Skipping database setup. Run migrations manually later."
fi

echo ""
echo "Setting up frontend..."
echo "===================="

cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    print_warning "Installing npm dependencies (this may take a few minutes)..."
    npm install --silent
    print_success "npm dependencies installed"
else
    print_warning "node_modules already exists, skipping install"
fi

# Create .env file
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

cd ..

echo ""
echo "=============================================="
print_success "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your configuration"
echo "2. Start Redis: redis-server"
echo "3. Start backend: cd backend && source venv/bin/activate && python manage.py runserver"
echo "4. Start frontend: cd frontend && npm start"
echo "5. Start Celery worker: cd backend && source venv/bin/activate && celery -A config worker -l info"
echo "6. Start Celery beat: cd backend && source venv/bin/activate && celery -A config beat -l info"
echo ""
echo "Access the application at: http://localhost:3000"
echo "Access the admin panel at: http://localhost:8000/admin"
echo ""
echo "For more details, see QUICK_START.md"
echo "=============================================="
