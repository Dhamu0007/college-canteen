from rest_framework import serializers
from .models import Coupon, CouponUsage
from datetime import datetime

class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    discount_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'name', 'description', 'discount_type',
            'discount_value', 'min_order_value', 'max_discount',
            'usage_limit', 'used_count', 'valid_from', 'valid_to',
            'is_active', 'is_for_new_customers', 'is_for_first_order',
            'is_valid', 'discount_display', 'created_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        valid, _ = obj.is_valid()
        return valid
    
    def get_discount_display(self, obj):
        if obj.discount_type == 'percentage':
            return f"{obj.discount_value}% off"
        return f"₹{obj.discount_value} off"

class CouponUsageSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    
    class Meta:
        model = CouponUsage
        fields = ['id', 'coupon', 'coupon_code', 'customer', 'customer_name', 'order', 'discount_amount', 'created_at']
        read_only_fields = ['id', 'created_at']

class ApplyCouponSerializer(serializers.Serializer):
    coupon_code = serializers.CharField(max_length=50)
    order_id = serializers.IntegerField(required=False)
    
    def validate_coupon_code(self, value):
        try:
            coupon = Coupon.objects.get(code=value)
            return coupon
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")