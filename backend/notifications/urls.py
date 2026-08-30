from django.urls import path
from .views import (
    NotificationListView, NotificationDetailView,
    MarkAllNotificationsReadView, UnreadCountView,
    SendNotificationView,
    NotificationTemplateListView, NotificationTemplateDetailView
)

urlpatterns = [
    # Notification endpoints
    path('', NotificationListView.as_view(), name='notifications'),
    path('<int:pk>/', NotificationDetailView.as_view(), name='notification_detail'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
    path('unread-count/', UnreadCountView.as_view(), name='unread_count'),
    path('send/', SendNotificationView.as_view(), name='send_notification'),
    
    # Template endpoints
    path('templates/', NotificationTemplateListView.as_view(), name='notification_templates'),
    path('templates/<int:pk>/', NotificationTemplateDetailView.as_view(), name='notification_template_detail'),
]