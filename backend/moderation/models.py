 """
Models for content moderation and reporting
"""
from django.db import models
from django.conf import settings
from posts.models import Post


class Report(models.Model):
    """Model for reporting inappropriate posts/comments"""
    
    id = models.AutoField(primary_key=True)  # Explicit primary key
    
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('hate_speech', 'Hate Speech'),
        ('violence', 'Violence'),
        ('self_harm', 'Self-harm'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('action_taken', 'Action Taken'),
        ('dismissed', 'Dismissed'),
    ]
    
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reports_made'
    )
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_reviewed'
    )
    
    class Meta:
        db_table = 'reports'
        ordering = ['-timestamp']
        # Prevent duplicate reports from same user for same post
        unique_together = ['post', 'reporter']
    
    def __str__(self):
        return f"Report #{self.id} - {self.reason} on {self.post.uuid}"
