"""
URL configuration for Anonymous Messaging Platform
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('posts.urls')),
    path('api/moderation/', include('moderation.urls')),
]
