from rest_framework import serializers
from .models import DeliveryPersonnel, DeliveryAssignment
from orders.serializers import OrderSerializer

class DeliveryPersonnelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPersonnel
        fields = ['id', 'user', 'full_name', 'phone_number', 'vehicle_number', 'is_available', 'current_location', 'created_at']
        read_only_fields = ['id', 'created_at']

class DeliveryAssignmentSerializer(serializers.ModelSerializer):
    personnel_details = DeliveryPersonnelSerializer(source='personnel', read_only=True)
    order_details = OrderSerializer(source='order', read_only=True)

    class Meta:
        model = DeliveryAssignment
        fields = ['id', 'order', 'personnel', 'personnel_details', 'order_details', 'status', 'assigned_at', 'delivered_at', 'notes']
        read_only_fields = ['id', 'assigned_at']
