"""
Celery tasks for scheduled operations
"""
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import random
from .models import Post, Topic


@shared_task
def delete_old_posts():
    """
    Delete posts older than 24 hours (auto-deletion)
    """
    time_limit = timezone.now() - timedelta(hours=settings.POST_DELETION_HOURS)
    old_posts = Post.objects.filter(timestamp__lte=time_limit)
    count = old_posts.count()
    old_posts.delete()
    
    return f"Deleted {count} posts older than 24 hours"


@shared_task
def update_daily_topic():
    """
    Create/update today's topic suggestion
    """
    today = timezone.now().date()
    
    # Sample topics (you can expand this list or integrate with an API)
    sample_topics = [
        "What's the best advice you've ever received?",
        "Share a random act of kindness you witnessed today.",
        "What's something you're grateful for right now?",
        "If you could learn any skill instantly, what would it be?",
        "What's a small victory you had this week?",
        "Share an unpopular opinion you have.",
        "What's the most interesting thing you learned recently?",
        "If you could have dinner with anyone, who would it be?",
        "What's a habit you're trying to build or break?",
        "Share something that made you smile today.",
        "What's your favorite way to unwind after a long day?",
        "If you could change one thing about the world, what would it be?",
        "What's a book/movie/show that changed your perspective?",
        "Share a childhood memory that still makes you happy.",
        "What's something you wish more people knew about?",
    ]
    
    # Check if topic already exists for today
    topic, created = Topic.objects.get_or_create(
        date=today,
        defaults={'topic': random.choice(sample_topics)}
    )
    
    if created:
        return f"Created new topic for {today}: {topic.topic}"
    else:
        return f"Topic already exists for {today}: {topic.topic}"
