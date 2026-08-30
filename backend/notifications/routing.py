from django.urls import re_path
from .consumers import NotificationConsumer, AdminNotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
    re_path(r'ws/admin/notifications/$', AdminNotificationConsumer.as_asgi()),
]