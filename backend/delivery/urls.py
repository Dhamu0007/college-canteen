from django.urls import path
from .views import GenerateDeliveryOTPView, VerifyDeliveryOTPView

urlpatterns = [
    path('generate-otp/<str:order_number>/', GenerateDeliveryOTPView.as_view(), name='generate_delivery_otp'),
    path('verify-otp/<str:order_number>/', VerifyDeliveryOTPView.as_view(), name='verify_delivery_otp'),
]