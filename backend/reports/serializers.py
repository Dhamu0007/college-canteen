from rest_framework import serializers
from .models import DailyReportSnapshot

class DailyReportSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyReportSnapshot
        fields = ['id', 'date', 'total_orders', 'delivered_orders', 'cancelled_orders', 'total_revenue', 'average_order_value', 'new_customers', 'created_at']
        read_only_fields = ['id', 'created_at']
