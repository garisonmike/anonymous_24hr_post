"""
Serializers for posts, comments, likes, and topics
"""
from rest_framework import serializers
from .models import Post, Like, Topic
from .utils import filter_content, generate_random_color


class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts and comments"""
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_comment = serializers.BooleanField(read_only=True)
    can_be_deleted_by_user = serializers.BooleanField(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()
    is_owned_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'uuid',
            'content',
            'topic',
            'parent_uuid',
            'timestamp',
            'views',
            'likes_count',
            'comments_count',
            'avatar_color',
            'is_comment',
            'can_be_deleted_by_user',
            'is_liked_by_user',
            'is_owned_by_user',
        ]
        read_only_fields = ['uuid', 'timestamp', 'views', 'avatar_color']
    
    def get_is_liked_by_user(self, obj):
        """Check if current user has liked this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_owned_by_user(self, obj):
        """Check if current user owns this post (for deletion)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False
    
    def validate_content(self, value):
        """Filter content for profanity and prohibited items"""
        filtered, violations = filter_content(value)
        
        if violations:
            raise serializers.ValidationError(
                f"Content contains prohibited items: {', '.join(violations)}"
            )
        
        return filtered
    
    def create(self, validated_data):
        """Create post with random avatar color and current user"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        validated_data['avatar_color'] = generate_random_color()
        return super().create(validated_data)


class PostDetailSerializer(PostSerializer):
    """Detailed post serializer with comments"""
    comments = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        """Get all comments for this post"""
        if obj.is_comment:
            return []
        
        comments = Post.objects.filter(parent_uuid=obj.uuid).order_by('-timestamp')
        return PostSerializer(
            comments,
            many=True,
            context=self.context
        ).data


class LikeSerializer(serializers.ModelSerializer):
    """Serializer for likes"""
    class Meta:
        model = Like
        fields = ['user', 'post', 'timestamp']
        read_only_fields = ['timestamp']


class TopicSerializer(serializers.ModelSerializer):
    """Serializer for topics"""
    class Meta:
        model = Topic
        fields = ['date', 'topic', 'created_at']
        read_only_fields = ['created_at']
