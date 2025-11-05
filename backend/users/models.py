"""
User model for authentication (identity never exposed publicly)
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for authentication only.
    Identity is never revealed in posts/comments.
    """
    date_joined = models.DateTimeField(auto_now_add=True)
    
    # Override email to make it optional
    email = models.EmailField(blank=True, null=True)
    
    def __str__(self):
        return self.username
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']
