from django.db import models
from accounts.models import User
from orders.models import Order

class DeliveryPersonnel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='delivery_profile')
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, unique=True)
    vehicle_number = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)
    current_location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Delivery: {self.full_name} ({'Available' if self.is_available else 'Busy'})"

class DeliveryAssignment(models.Model):
    STATUS_CHOICES = (
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery_assignment')
    personnel = models.ForeignKey(DeliveryPersonnel, on_delete=models.SET_NULL, null=True, related_name='assignments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='assigned')
    assigned_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Assignment #{self.id} for Order #{self.order.order_number}"
