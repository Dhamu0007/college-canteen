import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import AccessToken
from .models import Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        
        if not self.user or isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        self.room_group_name = f"user_{self.user.id}"
        
        # Join user's notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send unread count on connection
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'mark_as_read':
            notification_id = data.get('notification_id')
            if notification_id:
                success = await self.mark_notification_read(notification_id)
                if success:
                    unread_count = await self.get_unread_count()
                    await self.send(text_data=json.dumps({
                        'type': 'unread_count',
                        'count': unread_count
                    }))
        
        elif action == 'mark_all_read':
            success = await self.mark_all_read()
            if success:
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': 0
                }))
        
        elif action == 'get_notifications':
            limit = data.get('limit', 20)
            offset = data.get('offset', 0)
            notifications = await self.get_notifications(limit, offset)
            unread_count = await self.get_unread_count()
            
            await self.send(text_data=json.dumps({
                'type': 'notifications_list',
                'notifications': notifications,
                'unread_count': unread_count
            }))
    
    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps(event))
    
    async def order_status_update(self, event):
        """Send order status update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'order_update',
            'data': event['data']
        }))
    
    @database_sync_to_async
    def get_unread_count(self):
        return Notification.objects.filter(
            user=self.user,
            is_read=False
        ).count()
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user=self.user
            )
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False
    
    @database_sync_to_async
    def mark_all_read(self):
        Notification.objects.filter(
            user=self.user,
            is_read=False
        ).update(is_read=True)
        return True
    
    @database_sync_to_async
    def get_notifications(self, limit, offset):
        notifications = Notification.objects.filter(
            user=self.user
        ).order_by('-created_at')[offset:offset+limit]
        
        return [
            {
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'notification_type': n.notification_type,
                'is_read': n.is_read,
                'created_at': n.created_at.isoformat(),
                'related_order_id': n.related_order_id if n.related_order else None
            }
            for n in notifications
        ]

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        
        if not self.user or isinstance(self.user, AnonymousUser) or self.user.user_type != 'admin':
            await self.close()
            return
        
        self.room_group_name = "admin_notifications"
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def order_notification(self, event):
        """Send order notification to admin"""
        await self.send(text_data=json.dumps({
            'type': 'new_order',
            'data': event['data']
        }))
    
    async def order_status_update(self, event):
        """Send order status update to admin"""
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'data': event['data']
        }))