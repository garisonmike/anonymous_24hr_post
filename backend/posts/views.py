"""
Views for posts, comments, likes, and topics
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Q, F
from django.db import models
from datetime import timedelta

from .models import Post, Like, Topic
from .serializers import PostSerializer, PostDetailSerializer, TopicSerializer
from .permissions import IsOwnerOrReadOnly


class PostCreateThrottle(UserRateThrottle):
    """Throttle for post creation"""
    rate = '10/hour'


class LikeThrottle(UserRateThrottle):
    """Throttle for likes"""
    rate = '100/hour'


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for posts and comments
    """
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """
        Get posts, optionally filtered by parent_uuid for comments
        """
        queryset = Post.objects.all().select_related('topic').annotate(
            likes_count=Count('likes')
        )
        
        # Filter by parent_uuid to get comments for a specific post
        parent_uuid = self.request.query_params.get('parent_uuid', None)
        if parent_uuid:
            queryset = queryset.filter(parent_uuid=parent_uuid)
        else:
            # By default, only return top-level posts (not comments)
            queryset = queryset.filter(parent_uuid__isnull=True)
        
        return queryset
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def get_throttles(self):
        """Apply throttling for create action"""
        if self.action == 'create':
            return [PostCreateThrottle()]
        return super().get_throttles()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single post and increment view count
        """
        instance = self.get_object()
        
        # Increment view count
        instance.views += 1
        instance.save(update_fields=['views'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete post - only owner can delete within 24 hours
        """
        instance = self.get_object()
        
        # Check if user is owner
        if instance.user != request.user:
            return Response(
                {'error': 'You can only delete your own posts'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if within deletion window
        if not instance.can_be_deleted_by_user:
            return Response(
                {'error': 'Posts can only be deleted within 24 hours of creation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], throttle_classes=[LikeThrottle])
    def like(self, request, pk=None):
        """
        Like or unlike a post
        """
        post = self.get_object()
        user = request.user
        
        # Check if user already liked this post
        like = Like.objects.filter(user=user, post=post).first()
        
        if like:
            # Unlike
            like.delete()
            return Response(
                {'message': 'Post unliked', 'likes_count': post.likes_count},
                status=status.HTTP_200_OK
            )
        else:
            # Like
            Like.objects.create(user=user, post=post)
            return Response(
                {'message': 'Post liked', 'likes_count': post.likes_count},
                status=status.HTTP_201_CREATED
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_posts(self, request):
        """
        Get all posts created by current user
        """
        posts = Post.objects.filter(user=request.user).annotate(
            likes_count=Count('likes')
        ).order_by('-timestamp')
        
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


class TopicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for topics (read-only for users)
    """
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's topic"""
        today = timezone.now().date()
        topic = Topic.objects.filter(date=today).first()
        
        if topic:
            serializer = self.get_serializer(topic)
            return Response(serializer.data)
        
        return Response(
            {'message': 'No topic for today'},
            status=status.HTTP_404_NOT_FOUND
        )
