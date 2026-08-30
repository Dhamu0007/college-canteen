from django.urls import path
from .views import (
    CouponListView, CouponDetailView,
    AdminCouponListView, AdminCouponDetailView,
    ApplyCouponView, CouponUsageHistoryView
)

urlpatterns = [
    # Public endpoints
    path('', CouponListView.as_view(), name='coupons'),
    path('apply/', ApplyCouponView.as_view(), name='apply_coupon'),
    path('usage/', CouponUsageHistoryView.as_view(), name='coupon_usage'),
    
    # Admin endpoints
    path('admin/', AdminCouponListView.as_view(), name='admin_coupons'),
    path('admin/<str:code>/', AdminCouponDetailView.as_view(), name='admin_coupon_detail'),

    path('<str:code>/', CouponDetailView.as_view(), name='coupon_detail'),
]