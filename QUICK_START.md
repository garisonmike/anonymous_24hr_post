# Quick Start Guide

Get the Anonymous Messaging Platform running locally in just a few minutes!

## Prerequisites

Make sure you have installed:
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Quick Setup (5 Minutes)

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd anonymous_24hr_posts
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb anonymous_posts_db

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Seed filtered words
python manage.py seed_filtered_words
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional, defaults work for local)
cp .env.example .env
```

### 4. Start Redis

```bash
# On Linux/Mac
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis
```

### 5. Run Everything

Open 4 terminal windows:

**Terminal 1 - Django:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - React:**
```bash
cd frontend
npm start
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

**Terminal 4 - Celery Beat:**
```bash
cd backend
source venv/bin/activate
celery -A config beat -l info
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin

## First Steps

1. **Register an account** at http://localhost:3000/register
2. **Create a post** anonymously
3. **Like and comment** on posts
4. **Check "My Posts"** to see your own posts
5. **Visit admin panel** (if you're a superuser) to moderate content

## Common Commands

### Backend

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Delete old posts manually
python manage.py delete_old_posts

# Run tests
python manage.py test

# Open Django shell
python manage.py shell
```

### Frontend

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Database

```bash
# Access PostgreSQL
psql -U postgres -d anonymous_posts_db

# Backup database
pg_dump -U postgres anonymous_posts_db > backup.sql

# Restore database
psql -U postgres anonymous_posts_db < backup.sql
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'rest_framework'"
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "CSRF token missing or incorrect"
Make sure you're running the frontend and backend on the expected ports (3000 and 8000).

### "Connection refused" to database
Make sure PostgreSQL is running:
```bash
sudo systemctl start postgresql  # Linux
brew services start postgresql   # Mac
```

### "Connection refused" to Redis
Make sure Redis is running:
```bash
redis-server
```

### Posts not auto-deleting
Make sure Celery Beat is running (Terminal 4 above).

## Development Tips

### Hot Reload
Both Django and React support hot reload - your changes will automatically reflect without restart.

### Django Admin
Access at http://localhost:8000/admin to:
- View all posts (including user associations)
- Manage filtered words
- Review reports
- Manage topics

### API Testing
Use tools like:
- **Postman** or **Insomnia** for API testing
- **Django REST Framework's browsable API** at http://localhost:8000/api/

### Database GUI
Consider using:
- **pgAdmin** for PostgreSQL
- **DBeaver** (cross-platform)
- **TablePlus** (Mac)

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Need Help?

- Check the logs in the terminal windows
- Review the documentation files
- Open an issue on GitHub
- Check Django/React error messages carefully

---

Happy coding! 🚀
