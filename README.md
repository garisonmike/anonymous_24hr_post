# Anonymous Messaging Platform

A full-stack web application that provides a controlled anonymous messaging platform where users can post, comment, like, and interact with content without revealing their identities.

## 🌟 Features

### Core Features
- **Anonymous Posts & Comments**: Users can create posts anonymously with UUID-based identification
- **24-Hour Auto-Deletion**: All posts and comments automatically delete after 24 hours
- **User Deletion Window**: Users can delete their own posts within 24 hours
- **Likes & Views Tracking**: Track engagement on posts and comments anonymously
- **Nested Comments**: Comments are treated as mini-posts with full functionality
- **Daily Topics**: Rotating topic suggestions for community engagement

### Content Moderation
- **Profanity Filtering**: Automatic detection and masking of profane words
- **Prohibited Content Blocking**: Blocks URLs, emails, phone numbers, and social media handles
- **Reporting System**: Users can report inappropriate content
- **Admin Dashboard**: Moderators can review reports and delete content without seeing user identities

### Security & Privacy
- **Session-Based Authentication**: Secure login with Django sessions
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: Prevents spam and abuse
- **Strict Anonymity**: User identities never exposed publicly

## 🏗️ Technology Stack

### Backend
- **Django 4.2.7**: Web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database
- **Celery**: Scheduled tasks (auto-deletion)
- **Redis**: Task queue backend
- **better-profanity**: Content filtering

### Frontend
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **date-fns**: Date formatting

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (for Celery)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd anonymous_24hr_posts
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Update DB_NAME, DB_USER, DB_PASSWORD, SECRET_KEY, etc.
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb anonymous_posts_db

# Or using psql:
psql -U postgres
CREATE DATABASE anonymous_posts_db;
\q

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Seed filtered words (optional)
python manage.py seed_filtered_words
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (default settings should work for local development)
```

### 5. Redis Setup (for Celery)

```bash
# Install Redis (Ubuntu/Debian)
sudo apt-get install redis-server

# Or using Docker
docker run -d -p 6379:6379 redis

# Start Redis
redis-server
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Django Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - React Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Celery Worker (for scheduled tasks):**
```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

**Terminal 4 - Celery Beat (for scheduling):**
```bash
cd backend
source venv/bin/activate
celery -A config beat -l info
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## 📁 Project Structure

```
anonymous_24hr_posts/
├── backend/
│   ├── config/                 # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── ...
│   ├── users/                  # User authentication app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── posts/                  # Posts, comments, topics app
│   │   ├── models.py           # Post, Like, Topic, FilteredWord models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py            # Content filtering utilities
│   │   ├── tasks.py            # Celery tasks
│   │   └── management/
│   │       └── commands/
│   │           ├── delete_old_posts.py
│   │           └── seed_filtered_words.py
│   ├── moderation/             # Content moderation app
│   │   ├── models.py           # Report model
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── TopicBanner.js
│   │   │   ├── PostForm.js
│   │   │   └── PostCard.js
│   │   ├── pages/              # Page components
│   │   │   ├── Home.js
│   │   │   ├── PostDetail.js
│   │   │   ├── MyPosts.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   └── api.js          # API service
│   │   ├── utils/
│   │   │   ├── AuthContext.js  # Authentication context
│   │   │   └── helpers.js      # Utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user

### Posts
- `GET /api/posts/` - List all posts (paginated)
- `POST /api/posts/` - Create new post or comment
- `GET /api/posts/{uuid}/` - Get single post with comments
- `DELETE /api/posts/{uuid}/` - Delete post (owner only, within 24h)
- `POST /api/posts/{uuid}/like/` - Like/unlike post
- `GET /api/posts/my_posts/` - Get user's own posts

### Topics
- `GET /api/topics/` - List all topics
- `GET /api/topics/today/` - Get today's topic

### Moderation
- `GET /api/moderation/reports/` - List user's reports
- `POST /api/moderation/reports/` - Create report
- `GET /api/moderation/reports/pending/` - List pending reports (admin)
- `POST /api/moderation/reports/{id}/review/` - Review report (admin)

## 🎨 Key Design Decisions

### Anonymity Implementation
- Each post/comment has a **UUID** as its public identifier
- User identity is stored but **never exposed** in API responses
- Random avatar colors assigned to each post for visual distinction
- No usernames or personal info displayed publicly

### Comments as Posts
- Comments are stored as posts with a `parent_uuid` field
- Enables consistent features (likes, views, deletion) for both posts and comments
- Supports nested threading if needed in future

### Content Filtering
- **Profanity masking** (e.g., "fuck" → "f**k")
- **Prohibited content blocking**: URLs, emails, phone numbers, handles
- Database-driven filtered words list for easy updates
- Client-side validation + server-side enforcement

### 24-Hour Lifecycle
- Posts auto-delete after 24 hours via Celery scheduled task
- Users can manually delete within 24 hours
- `can_be_deleted_by_user` property enforces deletion window
- Celery Beat runs hourly to clean up old posts

## 🛡️ Security Features

1. **CSRF Protection**: Django CSRF tokens for all state-changing requests
2. **Rate Limiting**: DRF throttling on post creation and likes
3. **Session Authentication**: Secure server-side session management
4. **Input Validation**: Content validation on both client and server
5. **SQL Injection Prevention**: Django ORM parameterized queries
6. **XSS Prevention**: React's built-in XSS protection

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (Example with Gunicorn)

```bash
# Install gunicorn (already in requirements.txt)
pip install gunicorn

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Environment Variables for Production

Update `.env` file:
```env
DEBUG=False
SECRET_KEY=<strong-random-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy build/ directory to your hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

### Database Migrations in Production

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_filtered_words
```

## 🔧 Configuration

### Celery Configuration
Celery tasks are configured to run:
- **Hourly**: Delete posts older than 24 hours
- **Daily (midnight)**: Update daily topic

Edit `config/celery.py` to adjust schedules.

### Content Filtering
Add custom filtered words via Django admin or database:
```python
from posts.models import FilteredWord
FilteredWord.objects.create(word='badword', replacement='b*****d')
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open-source and available under the MIT License.

## 👥 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 🎯 Future Enhancements

- [ ] AI-powered content moderation
- [ ] Image/video upload support
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced comment threading
- [ ] User karma/reputation system (anonymized)
- [ ] Topic voting system
- [ ] Mobile apps (React Native)
- [ ] Internationalization (i18n)

## 📊 Database Schema

### User
- `id`: Primary key
- `username`: Unique username
- `password`: Hashed password
- `date_joined`: Timestamp

### Post
- `uuid`: UUID (primary identifier)
- `user_id`: Foreign key (hidden from public)
- `content`: Text content
- `topic_id`: Foreign key to Topic
- `parent_uuid`: UUID of parent post (for comments)
- `timestamp`: Creation timestamp
- `views`: View count
- `avatar_color`: Random color for visual identity

### Like
- `id`: Primary key
- `user_id`: Foreign key
- `post_id`: Foreign key
- `timestamp`: Like timestamp
- **Unique constraint**: (user_id, post_id)

### Topic
- `date`: Unique date
- `topic`: Topic text
- `created_at`: Timestamp

### FilteredWord
- `word`: Word to filter (unique)
- `replacement`: Replacement text
- `is_active`: Boolean flag

### Report
- `id`: Primary key
- `post_id`: Foreign key
- `reporter_id`: Foreign key
- `reason`: Reason choice
- `description`: Optional description
- `status`: Status choice
- `timestamp`: Report timestamp
- `reviewed_at`: Review timestamp
- `reviewed_by_id`: Foreign key to admin user

---

**Built with ❤️ for anonymous, safe, and engaging online communities.**
