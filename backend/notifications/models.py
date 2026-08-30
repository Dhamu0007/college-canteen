from django.db import models
from accounts.models import User
from orders.models import Order

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('order_status', 'Order Status'),
        ('food_ready', 'Food Ready'),
        ('order_delayed', 'Order Delayed'),
        ('special_offer', 'Special Offer'),
        ('coupon_announcement', 'Coupon Announcement'),
        ('canteen_announcement', 'Canteen Announcement'),
        ('general', 'General Message'),
        ('delivery_update', 'Delivery Update'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, default='general')
    related_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_sent_to_email = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self):
        return f"{self.title} for {self.user.username}"

class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=200)
    message_template = models.TextField()
    notification_type = models.CharField(max_length=50, choices=Notification.NOTIFICATION_TYPES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name