from rest_framework import serializers
from .models import Notification, NotificationTemplate
from orders.serializers import OrderSerializer

class NotificationSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='related_order', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'notification_type',
            'related_order', 'order_details', 'is_read',
            'is_sent_to_email', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SendNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=Notification.NOTIFICATION_TYPES)
    recipient_type = serializers.ChoiceField(choices=[
        ('single', 'Single User'),
        ('multiple', 'Multiple Users'),
        ('all', 'All Customers')
    ])
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    related_order_id = serializers.IntegerField(required=False)
    send_email = serializers.BooleanField(default=False)