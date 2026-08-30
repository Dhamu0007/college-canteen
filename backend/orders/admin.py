import random
import string
from django.contrib import admin
from django.utils import timezone
from .models import Order, OrderItem, OrderStatusHistory, Cart, CartItem
from accounts.utils import send_otp_sms, send_otp_email

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer', 'status', 'payment_status', 'payment_method', 'total_amount', 'delivery_otp', 'is_otp_verified', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'is_otp_verified', 'created_at')
    search_fields = ('order_number', 'customer__full_name', 'customer__phone_number', 'delivery_otp')
    inlines = [OrderItemInline, OrderStatusHistoryInline]

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            old_order = Order.objects.get(pk=obj.pk)
            old_status = old_order.status
            super().save_model(request, obj, form, change)
            new_status = obj.status
            
            # Create status history
            OrderStatusHistory.objects.create(
                order=obj,
                status=new_status,
                note=f"Status updated in Admin portal by {request.user.username}",
                created_by=request.user
            )

            # Generate delivery OTP if order is ready
            if new_status == 'ready' and not obj.delivery_otp:
                otp = ''.join(random.choices(string.digits, k=6))
                obj.delivery_otp = otp
                obj.save(update_fields=['delivery_otp'])
                if obj.customer.phone_number:
                    send_otp_sms(obj.customer.phone_number, otp)
                if obj.customer.email:
                    send_otp_email(obj.customer.email, otp)

            # Update delivered time
            if new_status == 'delivered':
                obj.delivered_at = timezone.now()
                obj.save(update_fields=['delivered_at'])
                obj.customer.total_orders += 1
                obj.customer.save(update_fields=['total_orders'])

            # Send status notification and WS update
            from .views import UpdateOrderStatusView
            view_inst = UpdateOrderStatusView()
            view_inst.send_status_notification(obj, old_status, new_status)
            view_inst.send_websocket_update(obj)
        else:
            super().save_model(request, obj, form, change)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('customer', 'total_items', 'subtotal', 'updated_at')
    search_fields = ('customer__full_name',)

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'total_price')
