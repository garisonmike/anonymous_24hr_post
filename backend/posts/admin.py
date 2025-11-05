from django.contrib import admin
from django.db.models import QuerySet
from typing import Any
from .models import Post, Like, Topic, FilteredWord


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """Admin interface for Post model"""
    list_display = ['uuid', 'get_content_preview', 'timestamp', 'views', 'likes_count', 'is_comment']
    list_filter = ['timestamp', 'parent_uuid']
    search_fields = ['uuid', 'content']
    readonly_fields = ['uuid', 'timestamp', 'views', 'likes_count']
    ordering = ['-timestamp']
    
    def get_content_preview(self, obj: Post) -> str:
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_content_preview.short_description = 'Content'  # type: ignore
    
    def is_comment(self, obj: Post) -> bool:
        return obj.is_comment
    is_comment.boolean = True  # type: ignore


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """Admin interface for Like model"""
    list_display = ['user', 'post', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['user__username', 'post__uuid']
    ordering = ['-timestamp']


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    """Admin interface for Topic model"""
    list_display = ['date', 'topic', 'created_at']
    list_filter = ['date']
    search_fields = ['topic']
    ordering = ['-date']


@admin.register(FilteredWord)
class FilteredWordAdmin(admin.ModelAdmin):
    """Admin interface for FilteredWord model"""
    list_display = ['word', 'replacement', 'is_active']
    list_filter = ['is_active']
    search_fields = ['word']
    ordering = ['word']
