from django.urls import path
from .views import DashboardStatsView, RevenueReportView, ProductPerformanceView

urlpatterns = [
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('revenue/', RevenueReportView.as_view(), name='revenue_report'),
    path('products/', ProductPerformanceView.as_view(), name='product_performance'),
]