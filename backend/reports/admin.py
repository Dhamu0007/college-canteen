from django.contrib import admin
from .models import DailyReportSnapshot

@admin.register(DailyReportSnapshot)
class DailyReportSnapshotAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_orders', 'delivered_orders', 'cancelled_orders', 'total_revenue', 'average_order_value', 'new_customers')
    search_fields = ('date',)
    ordering = ('-date',)
