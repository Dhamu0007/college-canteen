from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from orders.models import Order, OrderItem
from products.models import Product
from accounts.models import CustomerProfile

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        today_end = timezone.make_aware(datetime.combine(today, datetime.max.time()))
        
        # Today's stats
        today_orders = Order.objects.filter(created_at__range=[today_start, today_end])
        today_stats = {
            'total_income': today_orders.filter(payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            'total_orders': today_orders.count(),
            'pending_orders': today_orders.filter(status='placed').count(),
            'preparing_orders': today_orders.filter(status='preparing').count(),
            'ready_orders': today_orders.filter(status='ready').count(),
            'out_for_delivery_orders': today_orders.filter(status='out_for_delivery').count(),
            'delivered_orders': today_orders.filter(status='delivered').count(),
            'cancelled_orders': today_orders.filter(status='cancelled').count(),
        }
        
        # Overall stats
        overall_stats = {
            'total_customers': CustomerProfile.objects.count(),
            'total_products': Product.objects.filter(is_available=True).count(),
            'total_orders': Order.objects.count(),
            'total_revenue': Order.objects.filter(payment_status='paid').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
        }
        
        # Best selling products
        best_selling = OrderItem.objects.values('product__name', 'product__id', 'product__image')\
            .annotate(total_quantity=Sum('quantity'))\
            .order_by('-total_quantity')[:10]
        
        # Recent orders
        recent_orders = Order.objects.order_by('-created_at')[:10]
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'customer_name': order.customer.full_name,
                'total_amount': order.total_amount,
                'status': order.status,
                'created_at': order.created_at
            })
        
        return Response({
            'today': today_stats,
            'overall': overall_stats,
            'best_selling_products': list(best_selling),
            'recent_orders': recent_orders_data
        })

class RevenueReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        report_type = request.query_params.get('type', 'daily')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Custom date range
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1)
            start = timezone.make_aware(start)
            end = timezone.make_aware(end)
            orders = Order.objects.filter(
                created_at__range=[start, end],
                payment_status='paid'
            )
            
            return self.generate_custom_report(orders, start, end)
        
        # Daily report
        if report_type == 'daily':
            return self.generate_daily_report()
        
        # Weekly report
        elif report_type == 'weekly':
            return self.generate_weekly_report()
        
        # Monthly report
        elif report_type == 'monthly':
            return self.generate_monthly_report()
        
        # Yearly report
        elif report_type == 'yearly':
            return self.generate_yearly_report()
        
        return Response({'error': 'Invalid report type.'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    def generate_daily_report(self):
        """Generate daily report for the last 30 days"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        daily_data = []
        current = start_date
        while current <= end_date:
            day_start = current.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = current.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            orders = Order.objects.filter(
                created_at__range=[day_start, day_end],
                payment_status='paid'
            )
            
            daily_data.append({
                'date': current.strftime('%Y-%m-%d'),
                'total_orders': orders.count(),
                'total_revenue': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'average_order_value': orders.aggregate(Avg('total_amount'))['total_amount__avg'] or 0,
            })
            
            current += timedelta(days=1)
        
        return Response(daily_data)
    
    def generate_weekly_report(self):
        """Generate weekly report for the last 12 weeks"""
        end_date = timezone.now()
        start_date = end_date - timedelta(weeks=12)
        
        weekly_data = []
        current = start_date
        while current <= end_date:
            week_end = current + timedelta(days=6)
            
            orders = Order.objects.filter(
                created_at__range=[current, week_end],
                payment_status='paid'
            )
            
            weekly_data.append({
                'week_start': current.strftime('%Y-%m-%d'),
                'week_end': week_end.strftime('%Y-%m-%d'),
                'total_orders': orders.count(),
                'total_revenue': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'average_order_value': orders.aggregate(Avg('total_amount'))['total_amount__avg'] or 0,
            })
            
            current = week_end + timedelta(days=1)
        
        return Response(weekly_data)
    
    def generate_monthly_report(self):
        """Generate monthly report for the last 12 months"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=365)
        
        monthly_data = []
        current = start_date.replace(day=1)
        while current <= end_date:
            if current.month == 12:
                next_month = current.replace(year=current.year + 1, month=1, day=1)
            else:
                next_month = current.replace(month=current.month + 1, day=1)
            
            orders = Order.objects.filter(
                created_at__range=[current, next_month],
                payment_status='paid'
            )
            
            monthly_data.append({
                'month': current.strftime('%Y-%m'),
                'total_orders': orders.count(),
                'total_revenue': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'average_order_value': orders.aggregate(Avg('total_amount'))['total_amount__avg'] or 0,
            })
            
            current = next_month
        
        return Response(monthly_data)
    
    def generate_yearly_report(self):
        """Generate yearly report for the last 5 years"""
        end_date = timezone.now()
        start_date = end_date - timedelta(days=1825)  # 5 years
        
        yearly_data = []
        current = start_date.replace(month=1, day=1)
        while current <= end_date:
            year_end = current.replace(year=current.year + 1, month=1, day=1)
            
            orders = Order.objects.filter(
                created_at__range=[current, year_end],
                payment_status='paid'
            )
            
            yearly_data.append({
                'year': current.year,
                'total_orders': orders.count(),
                'total_revenue': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'average_order_value': orders.aggregate(Avg('total_amount'))['total_amount__avg'] or 0,
            })
            
            current = year_end
        
        return Response(yearly_data)
    
    def generate_custom_report(self, orders, start_date, end_date):
        """Generate custom date range report"""
        return Response({
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'total_orders': orders.count(),
            'total_revenue': orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            'average_order_value': orders.aggregate(Avg('total_amount'))['total_amount__avg'] or 0,
            'order_status_distribution': self.get_status_distribution(orders),
            'daily_breakdown': self.get_daily_breakdown(orders, start_date, end_date)
        })
    
    def get_status_distribution(self, orders):
        """Get order status distribution"""
        status_counts = orders.values('status').annotate(count=Count('id'))
        return {item['status']: item['count'] for item in status_counts}
    
    def get_daily_breakdown(self, orders, start_date, end_date):
        """Get daily breakdown for custom report"""
        daily = []
        current = start_date
        while current <= end_date:
            day_start = current.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = current.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            day_orders = orders.filter(created_at__range=[day_start, day_end])
            
            daily.append({
                'date': current.strftime('%Y-%m-%d'),
                'orders': day_orders.count(),
                'revenue': day_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            })
            
            current += timedelta(days=1)
        
        return daily

class ProductPerformanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Top selling products
        top_products = Product.objects.filter(is_available=True).order_by('-orders_count')[:20]
        
        product_data = []
        for product in top_products:
            # Get revenue for this product
            revenue = OrderItem.objects.filter(product=product).aggregate(
                Sum('total_price')
            )['total_price__sum'] or 0
            
            product_data.append({
                'id': product.id,
                'name': product.name,
                'image': product.image.url if product.image else None,
                'category': product.category.name,
                'total_orders_count': product.orders_count,
                'revenue': revenue,
                'average_rating': 4.5,  # Placeholder for rating system
            })
        
        return Response(product_data)