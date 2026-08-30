from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, CouponUsageSerializer, ApplyCouponSerializer
from orders.models import Order

class CouponListView(generics.ListAPIView):
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name']
    ordering_fields = ['valid_from', 'valid_to', 'discount_value']
    ordering = ['valid_from']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Coupon.objects.all()
        # Show only active and valid coupons for customers
        user = self.request.user
        if user.is_authenticated and getattr(user, 'user_type', None) == 'admin':
            return Coupon.objects.all()
        
        # For customers, show only active valid coupons
        return Coupon.objects.filter(
            is_active=True,
            valid_from__lte=timezone.now(),
            valid_to__gte=timezone.now()
        )

class CouponDetailView(generics.RetrieveAPIView):
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'code'

class AdminCouponListView(generics.ListCreateAPIView):
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Coupon.objects.all()
        if not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            return Coupon.objects.none()
        return Coupon.objects.all()
    
    def perform_create(self, serializer):
        if not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can create coupons.')
        serializer.save(created_by=self.request.user)

class AdminCouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'code'
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Coupon.objects.all()
        if not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            return Coupon.objects.none()
        return Coupon.objects.all()

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.is_authenticated and getattr(request.user, 'user_type', None) != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can access this resource.')

class ApplyCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can apply coupons.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = ApplyCouponSerializer(data=request.data)
        if serializer.is_valid():
            coupon = serializer.validated_data['coupon_code']
            order_id = request.data.get('order_id')
            
            # Validate coupon
            valid, message = coupon.is_valid(
                customer=request.user.customer_profile
            )
            
            if not valid:
                return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
            
            # If order_id provided, validate against order
            if order_id:
                try:
                    order = Order.objects.get(id=order_id, customer=request.user.customer_profile)
                    valid, message = coupon.is_valid(
                        customer=request.user.customer_profile,
                        order_value=order.subtotal
                    )
                    if not valid:
                        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Calculate discount
                    discount = coupon.calculate_discount(order.subtotal)
                    
                    return Response({
                        'message': 'Coupon applied successfully.',
                        'coupon': CouponSerializer(coupon).data,
                        'discount_amount': discount
                    })
                    
                except Order.DoesNotExist:
                    return Response({'error': 'Order not found.'}, 
                                  status=status.HTTP_404_NOT_FOUND)
            
            return Response({
                'message': 'Coupon is valid.',
                'coupon': CouponSerializer(coupon).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CouponUsageHistoryView(generics.ListAPIView):
    serializer_class = CouponUsageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return CouponUsage.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return CouponUsage.objects.none()
        user_type = getattr(user, 'user_type', None)
        if user_type == 'admin':
            return CouponUsage.objects.all()
        elif user_type == 'customer' and hasattr(user, 'customer_profile'):
            return CouponUsage.objects.filter(customer=user.customer_profile)
        return CouponUsage.objects.none()