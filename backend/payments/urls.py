from django.urls import path
from .views import (
    PaymentListView, PaymentDetailView,
    InitiatePaymentView, VerifyPaymentView,
    ProcessCashPaymentView
)

urlpatterns = [
    path('', PaymentListView.as_view(), name='payments'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('initiate/', InitiatePaymentView.as_view(), name='initiate_payment'),
    path('verify/', VerifyPaymentView.as_view(), name='verify_payment'),
    path('cash/<str:order_number>/', ProcessCashPaymentView.as_view(), name='process_cash_payment'),
]