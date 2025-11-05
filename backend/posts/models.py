"""
Models for posts, comments, topics, and likes
"""
import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Topic(models.Model):
    """Daily/weekly topic suggestions"""
    date = models.DateField(unique=True)
    topic = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'topics'
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.date}: {self.topic}"


class Post(models.Model):
    """
    Post model for anonymous posts and comments.
    Comments are posts with a parent_uuid.
    """
    id = models.AutoField(primary_key=True)  # Explicit primary key
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='posts'
    )
    content = models.TextField(max_length=5000)
    topic = models.ForeignKey(
        Topic,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    
    # For nested comments - parent_uuid links to another post
    parent_uuid = models.UUIDField(null=True, blank=True, db_index=True)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    views = models.IntegerField(default=0)
    
    # Random avatar/color for visual anonymity
    avatar_color = models.CharField(max_length=7, default='#6366f1')
    
    class Meta:
        db_table = 'posts'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['parent_uuid']),
            models.Index(fields=['uuid']),
        ]
    
    def __str__(self):
        return f"Post {self.uuid}"
    
    @property
    def is_comment(self):
        """Check if this post is a comment"""
        return self.parent_uuid is not None
    
    @property
    def can_be_deleted_by_user(self):
        """Check if post can still be deleted by user (within 24 hours)"""
        time_limit = timezone.now() - timedelta(hours=settings.POST_DELETION_HOURS)
        return self.timestamp > time_limit
    
    @property
    def should_auto_delete(self):
        """Check if post should be auto-deleted (older than 24 hours)"""
        time_limit = timezone.now() - timedelta(hours=settings.POST_DELETION_HOURS)
        return self.timestamp <= time_limit
    
    @property
    def likes_count(self):
        """Get total likes count"""
        return self.likes.count()
    
    @property
    def comments_count(self):
        """Get total comments count (only for parent posts)"""
        if self.is_comment:
            return 0
        return Post.objects.filter(parent_uuid=self.uuid).count()


class Like(models.Model):
    """
    Like model - users can like posts/comments once
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'likes'
        unique_together = ['user', 'post']
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"Like by {self.user.username} on {self.post.uuid}"


class FilteredWord(models.Model):
    """
    Profanity and prohibited words to filter
    """
    word = models.CharField(max_length=100, unique=True)
    replacement = models.CharField(max_length=100, default='***')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'filtered_words'
        ordering = ['word']
    
    def __str__(self):
        return f"{self.word} → {self.replacement}"
