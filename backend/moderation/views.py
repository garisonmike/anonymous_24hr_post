"""
Views for content moderation and reporting
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Report
from .serializers import ReportSerializer, ReportDetailSerializer
from posts.models import Post


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for reporting posts
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Regular users can only see their own reports
        Admins can see all reports
        """
        if self.request.user.is_staff:
            return Report.objects.all().select_related('post', 'reporter', 'reviewed_by')
        return Report.objects.filter(reporter=self.request.user)
    
    def get_serializer_class(self):
        """Use detailed serializer for admins"""
        if self.request.user.is_staff:
            return ReportDetailSerializer
        return ReportSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a report for a post"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if user already reported this post
        post = serializer.validated_data['post']
        existing_report = Report.objects.filter(
            post=post,
            reporter=request.user
        ).first()
        
        if existing_report:
            return Response(
                {'error': 'You have already reported this post'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def review(self, request, pk=None):
        """
        Admin action to review a report and optionally delete the post
        """
        report = self.get_object()
        action_type = request.data.get('action')  # 'delete_post', 'dismiss', 'mark_reviewed'
        
        if action_type == 'delete_post':
            # Delete the reported post (without seeing user identity)
            report.post.delete()
            report.status = 'action_taken'
            report.reviewed_by = request.user
            report.reviewed_at = timezone.now()
            report.save()
            
            return Response(
                {'message': 'Post deleted and report marked as action taken'},
                status=status.HTTP_200_OK
            )
        
        elif action_type == 'dismiss':
            report.status = 'dismissed'
            report.reviewed_by = request.user
            report.reviewed_at = timezone.now()
            report.save()
            
            return Response(
                {'message': 'Report dismissed'},
                status=status.HTTP_200_OK
            )
        
        elif action_type == 'mark_reviewed':
            report.status = 'reviewed'
            report.reviewed_by = request.user
            report.reviewed_at = timezone.now()
            report.save()
            
            return Response(
                {'message': 'Report marked as reviewed'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Invalid action type'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def pending(self, request):
        """Get all pending reports (admin only)"""
        pending_reports = Report.objects.filter(status='pending').select_related(
            'post', 'reporter', 'reviewed_by'
        )
        serializer = self.get_serializer(pending_reports, many=True)
        return Response(serializer.data)
