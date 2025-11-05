from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin interface for User model
    """
    list_display = ['username', 'date_joined', 'is_active', 'is_staff']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['username']
    ordering = ['-date_joined']
