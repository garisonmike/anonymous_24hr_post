# Deployment Guide

This guide covers deploying the Anonymous Messaging Platform to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Redis & Celery Setup](#redis--celery-setup)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL 14+
- Redis 6+
- Python 3.10+
- Node.js 18+
- Nginx (web server/reverse proxy)

---

## Backend Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx redis-server -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Create Application User

```bash
sudo adduser --system --group --home /opt/anonymous-platform anonymous
sudo su - anonymous
```

### 3. Deploy Application

```bash
# Clone repository
cd /opt/anonymous-platform
git clone <your-repo-url> app
cd app/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

### 4. Configure Environment

```bash
# Create .env file
nano .env
```

Add production configuration:
```env
SECRET_KEY=<generate-strong-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=anonymous_posts_db
DB_USER=anonymous_user
DB_PASSWORD=<strong-database-password>
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

### 5. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 6. Create Systemd Service for Gunicorn

```bash
sudo nano /etc/systemd/system/anonymous-platform.service
```

Add:
```ini
[Unit]
Description=Anonymous Platform Gunicorn Service
After=network.target

[Service]
User=anonymous
Group=anonymous
WorkingDirectory=/opt/anonymous-platform/app/backend
Environment="PATH=/opt/anonymous-platform/app/backend/venv/bin"
ExecStart=/opt/anonymous-platform/app/backend/venv/bin/gunicorn \
          --workers 4 \
          --bind unix:/opt/anonymous-platform/app/backend/gunicorn.sock \
          --timeout 120 \
          --access-logfile /var/log/anonymous-platform/access.log \
          --error-logfile /var/log/anonymous-platform/error.log \
          config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Create log directory:
```bash
sudo mkdir -p /var/log/anonymous-platform
sudo chown anonymous:anonymous /var/log/anonymous-platform
```

Start service:
```bash
sudo systemctl start anonymous-platform
sudo systemctl enable anonymous-platform
sudo systemctl status anonymous-platform
```

### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/anonymous-platform
```

Add:
```nginx
upstream django_app {
    server unix:/opt/anonymous-platform/app/backend/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (certbot will add this)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 10M;

    # Django static files
    location /static/ {
        alias /opt/anonymous-platform/app/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Django API
    location /api/ {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://django_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Frontend (if serving from same domain)
    location / {
        root /opt/anonymous-platform/app/frontend/build;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/anonymous-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Database Setup

### 1. Create PostgreSQL Database and User

```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE anonymous_posts_db;
CREATE USER anonymous_user WITH PASSWORD 'strong-password-here';
ALTER ROLE anonymous_user SET client_encoding TO 'utf8';
ALTER ROLE anonymous_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE anonymous_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE anonymous_posts_db TO anonymous_user;
\q
```

### 2. Run Migrations

```bash
cd /opt/anonymous-platform/app/backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_filtered_words
```

---

## Redis & Celery Setup

### 1. Configure Redis

```bash
sudo nano /etc/redis/redis.conf
```

Ensure these settings:
```conf
bind 127.0.0.1
protected-mode yes
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 2. Create Celery Worker Service

```bash
sudo nano /etc/systemd/system/celery-worker.service
```

Add:
```ini
[Unit]
Description=Celery Worker
After=network.target redis-server.service

[Service]
User=anonymous
Group=anonymous
WorkingDirectory=/opt/anonymous-platform/app/backend
Environment="PATH=/opt/anonymous-platform/app/backend/venv/bin"
ExecStart=/opt/anonymous-platform/app/backend/venv/bin/celery \
          -A config worker \
          --loglevel=info \
          --logfile=/var/log/anonymous-platform/celery-worker.log

[Install]
WantedBy=multi-user.target
```

### 3. Create Celery Beat Service

```bash
sudo nano /etc/systemd/system/celery-beat.service
```

Add:
```ini
[Unit]
Description=Celery Beat Scheduler
After=network.target redis-server.service

[Service]
User=anonymous
Group=anonymous
WorkingDirectory=/opt/anonymous-platform/app/backend
Environment="PATH=/opt/anonymous-platform/app/backend/venv/bin"
ExecStart=/opt/anonymous-platform/app/backend/venv/bin/celery \
          -A config beat \
          --loglevel=info \
          --logfile=/var/log/anonymous-platform/celery-beat.log \
          --pidfile=/var/run/celery-beat.pid

[Install]
WantedBy=multi-user.target
```

Start services:
```bash
sudo systemctl start celery-worker celery-beat
sudo systemctl enable celery-worker celery-beat
sudo systemctl status celery-worker celery-beat
```

---

## Frontend Deployment

### Option 1: Serve with Django (Same Domain)

```bash
cd /opt/anonymous-platform/app/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Files are now in build/ directory and served by Nginx
```

### Option 2: Deploy to Netlify/Vercel

1. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `build`

2. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

3. **Redirects (_redirects file for Netlify):**
   ```
   /*  /index.html  200
   ```

---

## Environment Configuration

### Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` (use `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- [ ] SSL enabled with valid certificate
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `CSRF_COOKIE_SECURE=True`
- [ ] `SECURE_SSL_REDIRECT=True`
- [ ] Strong database password
- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] Regular backups enabled
- [ ] Rate limiting configured
- [ ] Admin area protected

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Monitoring & Maintenance

### Log Management

View logs:
```bash
# Gunicorn logs
sudo tail -f /var/log/anonymous-platform/access.log
sudo tail -f /var/log/anonymous-platform/error.log

# Celery logs
sudo tail -f /var/log/anonymous-platform/celery-worker.log
sudo tail -f /var/log/anonymous-platform/celery-beat.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backup

Create backup script:
```bash
sudo nano /opt/anonymous-platform/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/opt/anonymous-platform/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR
pg_dump -U anonymous_user anonymous_posts_db | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
```

Make executable and add to cron:
```bash
chmod +x /opt/anonymous-platform/backup.sh
crontab -e
# Add: 0 2 * * * /opt/anonymous-platform/backup.sh
```

### Application Updates

```bash
cd /opt/anonymous-platform/app

# Pull latest code
git pull origin main

# Backend updates
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Frontend updates (if serving with Django)
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart anonymous-platform celery-worker celery-beat
```

### Monitoring Tools

Consider installing:
- **Prometheus + Grafana**: Metrics and visualization
- **Sentry**: Error tracking
- **Uptime Robot**: Uptime monitoring
- **Fail2ban**: Intrusion prevention

---

## Performance Optimization

### Database Optimization

```sql
-- Add indexes (already in models)
CREATE INDEX idx_posts_timestamp ON posts(timestamp DESC);
CREATE INDEX idx_posts_parent_uuid ON posts(parent_uuid);
CREATE INDEX idx_likes_user_post ON likes(user_id, post_id);
```

### Caching (Optional)

Install Redis caching:
```bash
pip install django-redis
```

Add to settings.py:
```python
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}
```

---

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check Gunicorn is running: `sudo systemctl status anonymous-platform`
   - Check socket permissions: `ls -l /opt/anonymous-platform/app/backend/gunicorn.sock`

2. **Static Files Not Loading**
   - Run `python manage.py collectstatic`
   - Check Nginx configuration
   - Verify file permissions

3. **Database Connection Error**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials in .env
   - Ensure user has proper permissions

4. **Celery Tasks Not Running**
   - Check Redis is running: `sudo systemctl status redis-server`
   - Check Celery worker/beat status
   - Review Celery logs

---

## Production Checklist

- [ ] All services running and enabled
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Log rotation configured
- [ ] Firewall properly configured
- [ ] Admin credentials secured
- [ ] Rate limiting tested
- [ ] Error pages customized
- [ ] Privacy policy and terms of service added
- [ ] GDPR compliance reviewed (if applicable)

---

## Support

For deployment issues, check:
- Application logs
- Nginx error logs
- System logs: `journalctl -xe`

Create an issue on GitHub for persistent problems.
