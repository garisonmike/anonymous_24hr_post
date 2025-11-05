"""
Management command to delete old posts (can be run manually or via cron)
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from posts.models import Post


class Command(BaseCommand):
    help = 'Delete posts older than 24 hours'
    
    def handle(self, *args, **options):
        time_limit = timezone.now() - timedelta(hours=settings.POST_DELETION_HOURS)
        old_posts = Post.objects.filter(timestamp__lte=time_limit)
        count = old_posts.count()
        
        if count > 0:
            old_posts.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully deleted {count} old posts')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('No old posts to delete')
            )
