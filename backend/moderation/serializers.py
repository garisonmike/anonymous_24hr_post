"""
Serializers for moderation and reporting
"""
from rest_framework import serializers
from .models import Report
from posts.serializers import PostSerializer


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    post_details = PostSerializer(source='post', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id',
            'post',
            'post_details',
            'reason',
            'description',
            'status',
            'timestamp',
        ]
        read_only_fields = ['id', 'status', 'timestamp']
    
    def create(self, validated_data):
        """Create report with current user as reporter"""
        request = self.context.get('request')
        validated_data['reporter'] = request.user
        return super().create(validated_data)


class ReportDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for admin review"""
    post_details = PostSerializer(source='post', read_only=True)
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id',
            'post',
            'post_details',
            'reporter_username',
            'reason',
            'description',
            'status',
            'timestamp',
            'reviewed_at',
            'reviewed_by_username',
        ]
        read_only_fields = ['id', 'timestamp', 'reviewed_at', 'reviewed_by_username']
