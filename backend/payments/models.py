from django.db import models
from orders.models import Order
from django.core.validators import MinValueValidator

class Payment(models.Model):
    PAYMENT_METHODS = (
        ('razorpay', 'Razorpay'),
        ('upi', 'UPI'),
        ('cash', 'Cash'),
        ('qr', 'QR Code'),
    )
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=200, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    upi_id = models.CharField(max_length=100, null=True, blank=True)
    qr_code = models.ImageField(upload_to='payments/qr/', null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'status']),
            models.Index(fields=['payment_id']),
        ]

    def __str__(self):
        return f"Payment for {self.order.order_number} - {self.status}"