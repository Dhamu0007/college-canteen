from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'image', 'is_active', 'order', 'product_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']
        read_only_fields = ['id']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    additional_images = ProductImageSerializer(many=True, read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discount_price',
            'final_price', 'discount_percentage', 'category', 'category_name',
            'food_type', 'preparation_time', 'is_available',
            'is_hot_item', 'is_popular', 'is_today_special', 'is_out_of_stock',
            'image', 'additional_images', 'views_count', 'orders_count', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'orders_count', 'created_at']

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'final_price', 'discount_percentage',
            'category', 'category_name', 'food_type', 'preparation_time',
            'is_available', 'is_hot_item', 'is_popular', 'is_today_special',
            'is_out_of_stock', 'image', 'orders_count'
        ]