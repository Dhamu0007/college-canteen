from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, RefreshTokenView,
    OTPRequestView, OTPVerifyView, FirebaseVerifyOTPView,
    ForgotPasswordView, ResetPasswordView,
    AdminProfileView, CustomerProfileView, CustomerListView,
    ChangePasswordView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('otp/request/', OTPRequestView.as_view(), name='otp_request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp_verify'),
    path('otp/firebase-verify/', FirebaseVerifyOTPView.as_view(), name='firebase_otp_verify'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('admin-profile/', AdminProfileView.as_view(), name='admin_profile'),
    path('customer-profile/', CustomerProfileView.as_view(), name='customer_profile'),
    path('customers/', CustomerListView.as_view(), name='customer_list'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]