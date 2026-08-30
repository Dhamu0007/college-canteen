from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'order_number', 'customer_name',
            'payment_method', 'payment_id', 'razorpay_order_id',
            'razorpay_payment_id', 'razorpay_signature', 'amount',
            'status', 'upi_id', 'qr_code', 'failure_reason',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']

class InitiatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHODS)

class VerifyPaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    razorpay_payment_id = serializers.CharField()
    razorpay_order_id = serializers.CharField()
    razorpay_signature = serializers.CharField()

class QRPaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    upi_id = serializers.CharField(max_length=100)