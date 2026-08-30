from django.contrib import admin
from .models import Coupon, CouponUsage

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'discount_type', 'discount_value', 'used_count', 'usage_limit', 'is_active', 'valid_from', 'valid_to')
    list_filter = ('discount_type', 'is_active', 'is_for_new_customers', 'is_for_first_order')
    search_fields = ('code', 'name', 'description')
    list_editable = ('is_active',)

@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):
    list_display = ('coupon', 'customer', 'order', 'discount_amount', 'created_at')
    search_fields = ('coupon__code', 'customer__full_name', 'order__order_number')
