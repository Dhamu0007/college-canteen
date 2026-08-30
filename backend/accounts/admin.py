from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AdminProfile, CustomerProfile, OTPVerification

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'phone_number', 'user_type', 'is_verified', 'is_staff')
    list_filter = ('user_type', 'is_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Profile Info', {'fields': ('user_type', 'phone_number', 'is_verified', 'profile_picture')}),
    )

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'role', 'phone_number', 'email')
    search_fields = ('full_name', 'email', 'phone_number')

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'phone_number', 'hostel_name', 'room_number', 'total_orders')
    search_fields = ('full_name', 'phone_number', 'email', 'hostel_name')
    list_filter = ('hostel_name',)

@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'otp_type', 'is_verified', 'created_at', 'expires_at')
    list_filter = ('otp_type', 'is_verified')
    search_fields = ('user__username', 'phone_number', 'email', 'otp')
