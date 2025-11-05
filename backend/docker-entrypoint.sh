#!/bin/sh
set -e

# Apply database migrations, collect static files, then start server
echo "Waiting for database..."

# Simple wait loop (adjust as needed)
if [ -n "$DATABASE_URL" ]; then
  # optional: parse host from URL or assume db is ready
  sleep 1
fi

echo "Creating migrations if needed"
python manage.py makemigrations --noinput || true

echo "Running migrations"
python manage.py migrate --noinput

echo "Collecting static files"
python manage.py collectstatic --noinput

exec "$@"
