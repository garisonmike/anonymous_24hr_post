"""
URL patterns for posts API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, TopicViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'topics', TopicViewSet, basename='topic')

urlpatterns = [
    path('', include(router.urls)),
]
