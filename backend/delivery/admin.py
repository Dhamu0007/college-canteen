from django.contrib import admin
from .models import DeliveryPersonnel, DeliveryAssignment

@admin.register(DeliveryPersonnel)
class DeliveryPersonnelAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'phone_number', 'vehicle_number', 'is_available', 'current_location')
    list_filter = ('is_available',)
    search_fields = ('full_name', 'phone_number', 'vehicle_number')

@admin.register(DeliveryAssignment)
class DeliveryAssignmentAdmin(admin.ModelAdmin):
    list_display = ('order', 'personnel', 'status', 'assigned_at', 'delivered_at')
    list_filter = ('status', 'assigned_at')
    search_fields = ('order__order_number', 'personnel__full_name')
