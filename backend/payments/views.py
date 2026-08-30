import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from .models import Payment
from .serializers import (
    PaymentSerializer, InitiatePaymentSerializer,
    VerifyPaymentSerializer, QRPaymentSerializer
)
from orders.models import Order
from orders.serializers import OrderSerializer

class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Payment.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return Payment.objects.none()
        user_type = getattr(user, 'user_type', None)
        if user_type == 'admin':
            return Payment.objects.all()
        elif user_type == 'customer' and hasattr(user, 'customer_profile'):
            return Payment.objects.filter(order__customer=user.customer_profile)
        return Payment.objects.none()

class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Payment.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return Payment.objects.none()
        user_type = getattr(user, 'user_type', None)
        if user_type == 'admin':
            return Payment.objects.all()
        elif user_type == 'customer' and hasattr(user, 'customer_profile'):
            return Payment.objects.filter(order__customer=user.customer_profile)
        return Payment.objects.none()

class InitiatePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can initiate payments.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = InitiatePaymentSerializer(data=request.data)
        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            payment_method = serializer.validated_data['payment_method']
            
            try:
                order = Order.objects.get(id=order_id, customer=request.user.customer_profile)
            except Order.DoesNotExist:
                return Response({'error': 'Order not found.'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            if order.payment_status == 'paid':
                return Response({'error': 'Order already paid.'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Check if payment already exists
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    'payment_method': payment_method,
                    'amount': order.total_amount,
                    'status': 'pending'
                }
            )
            
            # For Razorpay payment
            if payment_method == 'razorpay':
                return self.initiate_razorpay_payment(order, payment)
            
            # For QR/UPI payment
            elif payment_method in ['upi', 'qr']:
                return self.initiate_upi_payment(order, payment)
            
            # For cash payment
            elif payment_method == 'cash':
                return Response({
                    'message': 'Cash payment selected. Please pay at the canteen.',
                    'payment': PaymentSerializer(payment).data
                })
            
            return Response({'error': 'Invalid payment method.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def initiate_razorpay_payment(self, order, payment):
        """Initiate Razorpay payment"""
        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response({'error': 'Razorpay is not configured.'}, 
                          status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            
            # Create Razorpay order
            razorpay_order = client.order.create({
                'amount': int(order.total_amount * 100),  # Amount in paise
                'currency': 'INR',
                'payment_capture': 1,
                'receipt': order.order_number
            })
            
            payment.razorpay_order_id = razorpay_order['id']
            payment.status = 'processing'
            payment.save()
            
            return Response({
                'razorpay_key': settings.RAZORPAY_KEY_ID,
                'razorpay_order_id': razorpay_order['id'],
                'amount': order.total_amount,
                'order_number': order.order_number,
                'payment': PaymentSerializer(payment).data
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def initiate_upi_payment(self, order, payment):
        """Initiate UPI/QR payment"""
        # Generate UPI payment string
        upi_string = f"upi://pay?pa={payment.upi_id or 'your-upi-id@bank'}&pn=EM BABU THINNAVA?&am={order.total_amount}&cu=INR&tn=Payment for {order.order_number}"
        
        return Response({
            'message': 'UPI payment initiated.',
            'upi_string': upi_string,
            'amount': order.total_amount,
            'order_number': order.order_number,
            'payment': PaymentSerializer(payment).data
        })

class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can verify payments.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = VerifyPaymentSerializer(data=request.data)
        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
            razorpay_order_id = serializer.validated_data['razorpay_order_id']
            razorpay_signature = serializer.validated_data['razorpay_signature']
            
            try:
                order = Order.objects.get(id=order_id, customer=request.user.customer_profile)
                payment = Payment.objects.get(order=order, razorpay_order_id=razorpay_order_id)
            except (Order.DoesNotExist, Payment.DoesNotExist):
                return Response({'error': 'Order or payment not found.'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            # Verify signature
            if not self.verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
                payment.status = 'failed'
                payment.failure_reason = 'Invalid signature'
                payment.save()
                return Response({'error': 'Payment verification failed.'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Update payment and order
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'completed'
            payment.completed_at = timezone.now()
            payment.save()
            
            order.payment_status = 'paid'
            order.save(update_fields=['payment_status'])
            
            return Response({
                'message': 'Payment verified successfully.',
                'payment': PaymentSerializer(payment).data,
                'order': OrderSerializer(order).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def verify_razorpay_signature(self, order_id, payment_id, signature):
        """Verify Razorpay payment signature"""
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)
            return True
        except Exception as e:
            print(f"Signature verification failed: {e}")
            return False

class ProcessCashPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, order_number):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admin can process cash payments.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            order = Order.objects.get(order_number=order_number)
            payment = Payment.objects.get(order=order)
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response({'error': 'Order or payment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if payment.status == 'completed':
            return Response({'error': 'Payment already completed.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'completed'
        payment.completed_at = timezone.now()
        payment.save()
        
        order.payment_status = 'paid'
        order.save(update_fields=['payment_status'])
        
        return Response({
            'message': 'Cash payment processed successfully.',
            'payment': PaymentSerializer(payment).data,
            'order': OrderSerializer(order).data
        })