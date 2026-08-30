from rest_framework import serializers
from django.utils import timezone
from .models import Order, OrderItem, OrderStatusHistory, Cart, CartItem
from products.models import Product
from products.serializers import ProductListSerializer
import random
import string

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_details', 'product_name', 'quantity', 'price_per_unit', 'total_price']
        read_only_fields = ['id', 'product_name', 'total_price']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'note', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'status', 'status_display', 'payment_status', 'payment_status_display',
            'payment_method', 'payment_method_display', 'total_amount', 'subtotal',
            'discount_amount', 'coupon_code', 'delivery_address', 'special_instructions',
            'estimated_time', 'delivery_otp', 'is_otp_verified', 'items',
            'is_cancelled_by_customer', 'cancellation_reason', 'created_at',
            'updated_at', 'delivered_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'created_at', 'updated_at', 'delivered_at',
            'is_otp_verified', 'status_display', 'payment_status_display',
            'payment_method_display'
        ]

class CreateOrderSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHOD)
    delivery_address = serializers.CharField(max_length=500)
    special_instructions = serializers.CharField(max_length=500, required=False, allow_blank=True)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_null=True, allow_blank=True)
    
    def validate(self, data):
        # Check if cart exists and has items
        user = self.context['request'].user
        try:
            customer = user.customer_profile
            cart = customer.cart
            if cart.items.count() == 0:
                raise serializers.ValidationError("Cart is empty.")
        except (CustomerProfile.DoesNotExist, Cart.DoesNotExist):
            raise serializers.ValidationError("Customer or cart not found.")
        
        # Validate coupon if provided
        coupon_code = data.get('coupon_code')
        if coupon_code:
            from coupons.models import Coupon
            try:
                coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                if coupon.is_expired():
                    raise serializers.ValidationError("Coupon has expired.")
                if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
                    raise serializers.ValidationError("Coupon usage limit reached.")
                if coupon.min_order_value and cart.subtotal < coupon.min_order_value:
                    raise serializers.ValidationError(f"Minimum order value for this coupon is ₹{coupon.min_order_value}")
            except Coupon.DoesNotExist:
                raise serializers.ValidationError("Invalid coupon code.")
        
        return data

class UpdateOrderStatusSerializer(serializers.ModelSerializer):
    note = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Order
        fields = ['status', 'note']
    
    def validate_status(self, value):
        # Prevent changing from delivered/cancelled
        if self.instance.status in ['delivered', 'cancelled']:
            raise serializers.ValidationError("Cannot change status of delivered or cancelled orders.")
        return value

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity', 'price_per_unit', 'total_price']
        read_only_fields = ['id', 'total_price']

class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)

class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)