"""
Celery configuration for scheduled tasks
"""
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'delete-old-posts-every-hour': {
        'task': 'posts.tasks.delete_old_posts',
        'schedule': crontab(minute=0),  # Run every hour
    },
    'update-daily-topics': {
        'task': 'posts.tasks.update_daily_topic',
        'schedule': crontab(hour=0, minute=0),  # Run at midnight
    },
}
