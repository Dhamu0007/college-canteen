from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView,
    ProductListView, ProductDetailView,
    HotItemsView, PopularItemsView, TodaySpecialsView,
    AdminCategoryListView, AdminCategoryDetailView,
    AdminProductListView, AdminProductDetailView,
    ProductImageView
)

urlpatterns = [
    # Public endpoints
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('categories/<slug:slug>/', CategoryDetailView.as_view(), name='category_detail'),
    path('', ProductListView.as_view(), name='products'),
    path('hot-items/', HotItemsView.as_view(), name='hot_items'),
    path('popular-items/', PopularItemsView.as_view(), name='popular_items'),
    path('today-specials/', TodaySpecialsView.as_view(), name='today_specials'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='product_detail'),
    
    # Admin endpoints
    path('admin/categories/', AdminCategoryListView.as_view(), name='admin_categories'),
    path('admin/categories/<slug:slug>/', AdminCategoryDetailView.as_view(), name='admin_category_detail'),
    path('admin/products/', AdminProductListView.as_view(), name='admin_products'),
    path('admin/products/<slug:slug>/', AdminProductDetailView.as_view(), name='admin_product_detail'),
    path('admin/products/<int:product_id>/images/', ProductImageView.as_view(), name='product_images'),
    path('admin/products/<int:product_id>/images/<int:image_id>/', ProductImageView.as_view(), name='product_image_delete'),
]