from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from orders.models import Order
from accounts.utils import generate_otp, send_otp_sms, send_otp_email
import random
import string

class GenerateDeliveryOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, order_number):
        user_type = getattr(request.user, 'user_type', None)
        if user_type != 'admin' and not request.user.is_superuser and not request.user.is_staff:
            return Response({'error': 'Only admin can generate delivery OTP.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            if str(order_number).isdigit():
                order = Order.objects.get(Q(order_number=order_number) | Q(id=int(order_number)))
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if order.status != 'ready' and order.status != 'out_for_delivery':
            return Response({'error': 'OTP can only be generated for ready or out for delivery orders.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Generate OTP
        otp = ''.join(random.choices(string.digits, k=6))
        order.delivery_otp = otp
        order.save(update_fields=['delivery_otp'])
        
        # Send OTP to customer
        if order.customer.phone_number:
            send_otp_sms(order.customer.phone_number, otp)
        if order.customer.email:
            send_otp_email(order.customer.email, otp)
        
        return Response({
            'message': 'Delivery OTP generated and sent to customer.',
            'order_number': order.order_number,
            'otp': otp  # For development only, remove in production
        })

class VerifyDeliveryOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, order_number):
        otp = request.data.get('otp')
        
        if not otp:
            return Response({'error': 'OTP is required.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if str(order_number).isdigit():
                order = Order.objects.get(Q(order_number=order_number) | Q(id=int(order_number)))
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'},
                          status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        user_type = getattr(user, 'user_type', None)
        if user_type == 'customer' and hasattr(order.customer, 'user') and order.customer.user != user:
            return Response({'error': 'You can only verify your own orders.'},
                          status=status.HTTP_403_FORBIDDEN)
        elif user_type == 'admin' or user.is_superuser or user.is_staff:
            # Admin/staff can verify any order
            pass
        else:
            return Response({'error': 'Access denied.'},
                          status=status.HTTP_403_FORBIDDEN)
        
        if order.status == 'delivered':
            return Response({'error': 'Order already delivered.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not order.delivery_otp:
            return Response({'error': 'No delivery OTP generated for this order.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        if order.is_otp_verified:
            return Response({'error': 'OTP already verified.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        if order.delivery_otp != otp:
            return Response({'error': 'Invalid OTP.'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        order.is_otp_verified = True
        order.status = 'delivered'
        order.delivered_at = timezone.now()
        order.save(update_fields=['is_otp_verified', 'status', 'delivered_at'])
        
        # Update customer total orders
        order.customer.total_orders += 1
        order.customer.save(update_fields=['total_orders'])
        
        return Response({
            'message': 'Delivery verified successfully. Order completed.',
            'order_number': order.order_number,
            'status': order.status
        })