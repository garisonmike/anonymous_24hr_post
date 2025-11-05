from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin interface for Report model"""
    list_display = ['id', 'post', 'reason', 'status', 'timestamp', 'reviewed_at']
    list_filter = ['reason', 'status', 'timestamp']
    search_fields = ['post__uuid', 'description']
    readonly_fields = ['timestamp', 'reporter']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Report Information', {
            'fields': ('post', 'reporter', 'reason', 'description', 'timestamp')
        }),
        ('Review Information', {
            'fields': ('status', 'reviewed_by', 'reviewed_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Set reviewed_by to current admin user when status changes"""
        if change and 'status' in form.changed_data:
            if obj.status in ['reviewed', 'action_taken', 'dismissed']:
                obj.reviewed_by = request.user
                from django.utils import timezone
                obj.reviewed_at = timezone.now()
        super().save_model(request, obj, form, change)
