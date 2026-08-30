from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User, CustomerProfile
from datetime import datetime, timedelta

from django.utils import timezone

class Coupon(models.Model):
    DISCOUNT_TYPE = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    usage_limit = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    used_count = models.IntegerField(default=0)
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    is_for_new_customers = models.BooleanField(default=False)
    is_for_first_order = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['valid_from', 'valid_to']),
        ]

    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '₹'}"
    
    def is_expired(self):
        """Check if coupon is expired"""
        now = timezone.now()
        return self.valid_to < now or not self.is_active

    def is_valid(self, customer=None, order_value=None):
        """Check if coupon is valid for the given customer and order"""
        if not self.is_active:
            return False, "Coupon is not active."
        
        now = timezone.now()
        if self.valid_from > now:
            return False, "Coupon hasn't started yet."
        
        if self.valid_to < now:
            return False, "Coupon has expired."
        
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, "Coupon usage limit reached."
        
        if order_value and self.min_order_value and order_value < self.min_order_value:
            return False, f"Minimum order value is ₹{self.min_order_value}"
        
        if self.is_for_new_customers and customer:
            if CustomerOrder.objects.filter(customer=customer).exists():
                return False, "This coupon is only for new customers."
        
        if self.is_for_first_order and customer:
            if CustomerOrder.objects.filter(customer=customer).exists():
                return False, "This coupon is only for first orders."
        
        return True, "Coupon is valid."
    
    def calculate_discount(self, order_value):
        """Calculate discount amount for the given order value"""
        if self.discount_type == 'percentage':
            discount = (self.discount_value / 100) * order_value
        else:
            discount = self.discount_value
        
        if self.max_discount and discount > self.max_discount:
            discount = self.max_discount
        
        return min(discount, order_value)
    
    def use_coupon(self):
        """Increment usage count"""
        self.used_count += 1
        self.save(update_fields=['used_count'])

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name='usages')
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='coupon_usages')
    order = models.ForeignKey('orders.Order', on_delete=models.CASCADE, related_name='coupon_usages')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['coupon', 'customer', 'order']

    def __str__(self):
        return f"{self.coupon.code} used by {self.customer.full_name}"

# Import this to avoid circular import
from orders.models import Order as CustomerOrder