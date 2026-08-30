from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, F
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductSerializer, ProductListSerializer, ProductImageSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'name']
    ordering = ['order']

class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'food_type', 'is_hot_item', 'is_popular', 'is_today_special']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at', 'orders_count']
    ordering = ['-is_hot_item', '-is_popular', 'name']

    def get_queryset(self):
        return Product.objects.filter(is_available=True)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class HotItemsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(
            is_available=True,
            is_out_of_stock=False,
            is_hot_item=True
        ).order_by('-orders_count')

class PopularItemsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(
            is_available=True,
            is_out_of_stock=False,
            is_popular=True
        ).order_by('-orders_count')

class TodaySpecialsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(
            is_available=True,
            is_out_of_stock=False,
            is_today_special=True
        )

# Admin Views
class AdminCategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        if getattr(self.request.user, 'user_type', None) != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can create categories.')
        serializer.save()

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value and str(lookup_value).isdigit():
            obj = queryset.filter(Q(id=int(lookup_value)) | Q(slug=lookup_value)).first()
        else:
            obj = queryset.filter(slug=lookup_value).first()
        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound('Category not found.')
        self.check_object_permissions(self.request, obj)
        return obj

class AdminProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        if getattr(self.request.user, 'user_type', None) != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admin can create products.')
        serializer.save()

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated or getattr(self.request.user, 'user_type', None) != 'admin':
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get(self.lookup_field)
        if lookup_value and str(lookup_value).isdigit():
            obj = queryset.filter(Q(id=int(lookup_value)) | Q(slug=lookup_value)).first()
        else:
            obj = queryset.filter(slug=lookup_value).first()
        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound('Product not found.')
        self.check_object_permissions(self.request, obj)
        return obj

class ProductImageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, product_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admin can manage product images.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        created_images = []
        for i, image in enumerate(images):
            product_image = ProductImage.objects.create(
                product=product,
                image=image,
                order=i,
                is_primary=(i == 0)
            )
            created_images.append(ProductImageSerializer(product_image).data)
        
        return Response(created_images, status=status.HTTP_201_CREATED)
    
    def delete(self, request, product_id, image_id=None):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admin can manage product images.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            product = Product.objects.get(id=product_id)
            if image_id:
                image = ProductImage.objects.get(id=image_id, product=product)
                image.delete()
                return Response({'message': 'Image deleted successfully.'})
            else:
                # Delete all images for the product
                product.additional_images.all().delete()
                return Response({'message': 'All images deleted successfully.'})
        except (Product.DoesNotExist, ProductImage.DoesNotExist):
            return Response({'error': 'Resource not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)