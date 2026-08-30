from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.mail import send_mail
from .models import Notification, NotificationTemplate
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer,
    SendNotificationSerializer
)
from accounts.models import User

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)

class NotificationDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return Notification.objects.none()
        return Notification.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save()

class MarkAllNotificationsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})

class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

class SendNotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admin can send notifications.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = SendNotificationSerializer(data=request.data)
        if serializer.is_valid():
            title = serializer.validated_data['title']
            message = serializer.validated_data['message']
            notification_type = serializer.validated_data['notification_type']
            recipient_type = serializer.validated_data['recipient_type']
            user_ids = serializer.validated_data.get('user_ids', [])
            send_email = serializer.validated_data.get('send_email', False)
            
            # Get recipients
            if recipient_type == 'single':
                if not user_ids:
                    return Response({'error': 'User ID required for single recipient.'},
                                  status=status.HTTP_400_BAD_REQUEST)
                recipients = User.objects.filter(id__in=user_ids)
            elif recipient_type == 'multiple':
                if not user_ids:
                    return Response({'error': 'User IDs required for multiple recipients.'},
                                  status=status.HTTP_400_BAD_REQUEST)
                recipients = User.objects.filter(id__in=user_ids)
            else:  # all
                recipients = User.objects.filter(user_type='customer')
            
            if not recipients.exists():
                return Response({'error': 'No recipients found.'},
                              status=status.HTTP_404_NOT_FOUND)
            
            # Create notifications
            notifications = []
            for user in recipients:
                notification = Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    is_read=False
                )
                notifications.append(notification)
                
                # Send WebSocket notification
                self.send_websocket_notification(user.id, notification)
                
                # Send email if requested
                if send_email:
                    self.send_email_notification(user, notification)
            
            return Response({
                'message': f'Notification sent to {len(notifications)} users.',
                'count': len(notifications)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_websocket_notification(self, user_id, notification):
        """Send notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    'type': 'notification_message',
                    'data': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'notification_type': notification.notification_type,
                        'created_at': str(notification.created_at),
                        'is_read': notification.is_read
                    }
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket notification: {e}")
    
    def send_email_notification(self, user, notification):
        """Send email notification"""
        try:
            subject = f"EM BABU THINNAVA? - {notification.title}"
            message = f"""
            Hello {user.username},
            
            {notification.message}
            
            ---
            This is an automated notification from EM BABU THINNAVA?
            """
            send_mail(subject, message, None, [user.email])
        except Exception as e:
            print(f"Error sending email notification: {e}")

# Admin views for notification templates
class NotificationTemplateListView(generics.ListCreateAPIView):
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return NotificationTemplate.objects.all()
        if not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            return NotificationTemplate.objects.none()
        return NotificationTemplate.objects.all()

class NotificationTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return NotificationTemplate.objects.all()
        if not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            return NotificationTemplate.objects.none()
        return NotificationTemplate.objects.all()