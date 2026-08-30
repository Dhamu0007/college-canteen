from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.core.mail import send_mail
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order, OrderItem, OrderStatusHistory, Cart, CartItem
from .serializers import (
    OrderSerializer, CreateOrderSerializer, UpdateOrderStatusSerializer,
    CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer,
    OrderStatusHistorySerializer
)
from products.models import Product
from accounts.models import CustomerProfile
from accounts.utils import generate_otp, send_otp_sms, send_otp_email
from notifications.models import Notification
import random
import string

class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    ordering_fields = ['created_at', 'total_amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        user_type = getattr(user, 'user_type', None)
        if user_type == 'admin':
            return Order.objects.all()
        elif user_type == 'customer' and hasattr(user, 'customer_profile'):
            return Order.objects.filter(customer=user.customer_profile)
        return Order.objects.none()

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'order_number'
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Order.objects.all()
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        user_type = getattr(user, 'user_type', None)
        if user_type == 'admin':
            return Order.objects.all()
        elif user_type == 'customer' and hasattr(user, 'customer_profile'):
            return Order.objects.filter(customer=user.customer_profile)
        return Order.objects.none()

class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can place orders.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            customer = request.user.customer_profile
            cart = customer.cart
            cart_items = cart.items.all()
            
            if not cart_items:
                return Response({'error': 'Cart is empty.'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate totals
            subtotal = cart.subtotal
            discount_amount = 0
            coupon_code = serializer.validated_data.get('coupon_code')
            
            # Apply coupon if provided
            if coupon_code:
                from coupons.models import Coupon
                try:
                    coupon = Coupon.objects.get(code=coupon_code, is_active=True)
                    if not coupon.is_expired():
                        discount = coupon.calculate_discount(subtotal)
                        discount_amount = discount
                except Coupon.DoesNotExist:
                    pass
            
            total_amount = subtotal - discount_amount
            
            # Generate order number
            order_number = f"ORD{timezone.now().strftime('%Y%m%d')}{random.randint(1000, 9999)}"
            
            # Create order
            order = Order.objects.create(
                customer=customer,
                order_number=order_number,
                payment_method=serializer.validated_data['payment_method'],
                delivery_address=serializer.validated_data['delivery_address'],
                special_instructions=serializer.validated_data.get('special_instructions', ''),
                subtotal=subtotal,
                discount_amount=discount_amount,
                coupon_code=coupon_code,
                total_amount=total_amount,
                estimated_time=20  # Default estimation
            )
            
            # Create order items
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    product_name=cart_item.product.name,
                    quantity=cart_item.quantity,
                    price_per_unit=cart_item.price_per_unit,
                    total_price=cart_item.total_price
                )
                
                # Update product order count
                product = cart_item.product
                product.orders_count += cart_item.quantity
                product.save(update_fields=['orders_count'])
            
            # Create status history
            OrderStatusHistory.objects.create(
                order=order,
                status='placed',
                note='Order placed successfully.',
                created_by=request.user
            )
            
            # Clear cart
            cart_items.delete()
            
            # Create notification for customer
            customer_notification = Notification.objects.create(
                user=order.customer.user,
                title=f"Order #{order.order_number} Placed",
                message="🛍️ Your order has been placed successfully!",
                notification_type='order_status',
                related_order=order,
                is_read=False
            )

            # Send WebSocket notification to customer
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{order.customer.user.id}",
                    {
                        'type': 'notification_message',
                        'data': {
                            'id': customer_notification.id,
                            'title': customer_notification.title,
                            'message': customer_notification.message,
                            'notification_type': customer_notification.notification_type,
                            'related_order_id': order.id,
                            'created_at': str(customer_notification.created_at),
                            'is_read': customer_notification.is_read
                        }
                    }
                )
            except Exception as e:
                print(f"Error sending customer order creation WebSocket notification: {e}")

            # Send notification to admin
            self.send_order_notification(order, 'placed')
            
            # Send real-time notification via WebSocket
            self.send_websocket_notification(order)
            
            return Response({
                'message': 'Order created successfully.',
                'order': OrderSerializer(order, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_order_notification(self, order, status):
        """Send email notification for order"""
        try:
            subject = f"New Order #{order.order_number} - EM BABU THINNAVA?"
            message = f"""
            New order has been placed.
            
            Order Number: {order.order_number}
            Customer: {order.customer.full_name}
            Total Amount: ₹{order.total_amount}
            
            Please check the admin dashboard for more details.
            """
            send_mail(subject, message, None, [order.customer.email])
        except Exception as e:
            print(f"Error sending email notification: {e}")
    
    def send_websocket_notification(self, order):
        """Send real-time notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "admin_notifications",
                {
                    'type': 'order_notification',
                    'data': {
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'customer_name': order.customer.full_name,
                        'total_amount': str(order.total_amount),
                        'status': order.status,
                        'timestamp': str(order.created_at)
                    }
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket notification: {e}")

class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def patch(self, request, order_number):
        user_type = getattr(request.user, 'user_type', None)
        if user_type != 'admin' and not request.user.is_superuser and not request.user.is_staff:
            return Response({'error': 'Only admin can update order status.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            if str(order_number).isdigit():
                order = Order.objects.get(Q(order_number=order_number) | Q(id=int(order_number)))
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        serializer = UpdateOrderStatusSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            old_status = order.status
            order = serializer.save()
            new_status = order.status
            
            # Create status history
            OrderStatusHistory.objects.create(
                order=order,
                status=new_status,
                note=request.data.get('note', ''),
                created_by=request.user
            )
            
            # Generate delivery OTP if order is ready
            if new_status == 'ready' and not order.delivery_otp:
                otp = ''.join(random.choices(string.digits, k=6))
                order.delivery_otp = otp
                order.save(update_fields=['delivery_otp'])
                
                # Send OTP to customer
                if order.customer.phone_number:
                    send_otp_sms(order.customer.phone_number, otp)
                if order.customer.email:
                    send_otp_email(order.customer.email, otp)
            
            # Update delivered time
            if new_status == 'delivered':
                order.delivered_at = timezone.now()
                order.save(update_fields=['delivered_at'])
                order.customer.total_orders += 1
                order.customer.save(update_fields=['total_orders'])
            
            # Send notification to customer
            self.send_status_notification(order, old_status, new_status)
            
            # Send real-time update via WebSocket
            self.send_websocket_update(order)
            
            return Response({
                'message': f'Order status updated to {order.get_status_display()}.',
                'order': OrderSerializer(order, context={'request': request}).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def send_status_notification(self, order, old_status, new_status):
        """Send notification to customer about status change"""
        status_messages = {
            'accepted': "👨‍🍳 Your order has been accepted by the chef!",
            'preparing': "🍳 Your food is now being prepared. Estimated time: {} minutes.",
            'almost_ready': "♨️ Your order is almost ready! Just a few more minutes.",
            'ready': "🍛 Babu! Nee food ready ayyindi! Please collect it from the canteen.",
            'out_for_delivery': "🛵 Your order is out for delivery!",
            'delivered': "😋 Order delivered successfully! Enjoy your meal!",
            'cancelled': "❌ Your order has been cancelled."
        }
        
        message = status_messages.get(new_status, f"Order status updated to: {new_status}")
        if new_status == 'preparing':
            message = message.format(order.estimated_time or 20)
        
        # Create notification
        notification = Notification.objects.create(
            user=order.customer.user,
            title=f"Order #{order.order_number} Update",
            message=message,
            notification_type='order_status',
            related_order=order,
            is_read=False
        )
        
        # Send WebSocket notification to customer
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{order.customer.user.id}",
                {
                    'type': 'notification_message',
                    'data': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'notification_type': notification.notification_type,
                        'related_order_id': order.id,
                        'created_at': str(notification.created_at),
                        'is_read': notification.is_read
                    }
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket notification: {e}")

        # Send email notification
        try:
            subject = f"Order #{order.order_number} Update - EM BABU THINNAVA?"
            send_mail(subject, message, None, [order.customer.email])
        except Exception as e:
            print(f"Error sending email notification: {e}")
    
    def send_websocket_update(self, order):
        """Send real-time update via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            
            # Send to admin group
            async_to_sync(channel_layer.group_send)(
                "admin_notifications",
                {
                    'type': 'order_status_update',
                    'data': {
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'status': order.status,
                        'status_display': order.get_status_display(),
                        'timestamp': str(timezone.now())
                    }
                }
            )
            
            # Send to customer specific group
            async_to_sync(channel_layer.group_send)(
                f"user_{order.customer.user.id}",
                {
                    'type': 'order_status_update',
                    'data': {
                        'order_id': order.id,
                        'order_number': order.order_number,
                        'status': order.status,
                        'status_display': order.get_status_display(),
                        'timestamp': str(timezone.now())
                    }
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket update: {e}")

class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, order_number):
        try:
            if str(order_number).isdigit():
                order = Order.objects.get(Q(order_number=order_number) | Q(id=int(order_number)))
            else:
                order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user can cancel
        user = request.user
        if getattr(user, 'user_type', None) == 'customer':
            if hasattr(order.customer, 'user') and order.customer.user != user:
                return Response({'error': 'You can only cancel your own orders.'}, 
                              status=status.HTTP_403_FORBIDDEN)
        elif getattr(user, 'user_type', None) != 'admin' and not user.is_superuser and not user.is_staff:
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Check if order can be cancelled
        if order.status in ['delivered', 'cancelled']:
            return Response({'error': 'This order cannot be cancelled.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Update order
        order.status = 'cancelled'
        order.is_cancelled_by_customer = (user.user_type == 'customer')
        order.cancellation_reason = request.data.get('reason', '')
        order.save(update_fields=['status', 'is_cancelled_by_customer', 'cancellation_reason'])
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            status='cancelled',
            note=f"Cancelled by {user.user_type}. Reason: {order.cancellation_reason}",
            created_by=user
        )
        
        # Send notification
        notification = Notification.objects.create(
            user=order.customer.user,
            title=f"Order #{order.order_number} Cancelled",
            message="❌ Your order has been cancelled.",
            notification_type='order_status',
            related_order=order,
            is_read=False
        )
        
        # Send WebSocket notification to customer
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{order.customer.user.id}",
                {
                    'type': 'notification_message',
                    'data': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'notification_type': notification.notification_type,
                        'related_order_id': order.id,
                        'created_at': str(notification.created_at),
                        'is_read': notification.is_read
                    }
                }
            )
        except Exception as e:
            print(f"Error sending WebSocket notification: {e}")

        # Send WebSocket update
        update_view = UpdateOrderStatusView()
        update_view.send_websocket_update(order)
        
        return Response({
            'message': 'Order cancelled successfully.',
            'order': OrderSerializer(order, context={'request': request}).data
        })

# Cart Views
class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can access cart.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        customer = request.user.customer_profile
        cart, created = Cart.objects.get_or_create(customer=customer)
        items = CartItemSerializer(cart.items.all(), many=True, context={'request': request}).data
        
        return Response({
            'items': items,
            'subtotal': cart.subtotal,
            'total_items': cart.total_items
        })

class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can add to cart.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data['quantity']
            
            try:
                product = Product.objects.get(id=product_id, is_available=True, is_out_of_stock=False)
            except Product.DoesNotExist:
                return Response({'error': 'Product not available.'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            customer = request.user.customer_profile
            cart, created = Cart.objects.get_or_create(customer=customer)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={
                    'quantity': quantity,
                    'price_per_unit': product.final_price
                }
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            return Response({
                'message': f'Added {product.name} to cart.',
                'cart_item': CartItemSerializer(cart_item, context={'request': request}).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateCartItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, item_id):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can update cart.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            try:
                cart_item = CartItem.objects.get(id=item_id, cart__customer=request.user.customer_profile)
            except CartItem.DoesNotExist:
                return Response({'error': 'Cart item not found.'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            cart_item.quantity = serializer.validated_data['quantity']
            cart_item.save()
            
            return Response({
                'message': 'Cart item updated.',
                'cart_item': CartItemSerializer(cart_item, context={'request': request}).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, item_id):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can remove from cart.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart__customer=request.user.customer_profile)
            cart_item.delete()
            return Response({'message': 'Item removed from cart.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

class ClearCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Only customers can clear cart.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        cart, _ = Cart.objects.get_or_create(customer=request.user.customer_profile)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})

class OrderStatusHistoryView(generics.ListAPIView):
    serializer_class = OrderStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return OrderStatusHistory.objects.all()
        order_number = self.kwargs.get('order_number')
        try:
            if str(order_number).isdigit():
                order = Order.objects.get(Q(order_number=order_number) | Q(id=int(order_number)))
            else:
                order = Order.objects.get(order_number=order_number)
            user = self.request.user
            if not user.is_authenticated:
                return OrderStatusHistory.objects.none()
            if getattr(user, 'user_type', None) == 'admin' or user.is_superuser or user.is_staff or (hasattr(order.customer, 'user') and order.customer.user == user):
                return OrderStatusHistory.objects.filter(order=order)
        except Order.DoesNotExist:
            pass
        return OrderStatusHistory.objects.none()