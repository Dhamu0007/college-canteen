from django.contrib import admin
from django.utils.html import mark_safe
from .models import Category, Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" />')
        return "No image"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'slug', 'is_active', 'order', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_active', 'order')
    search_fields = ('name', 'description')

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" />')
        return "No image"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'category', 'price', 'discount_price', 'food_type', 'is_available', 'is_hot_item', 'is_popular', 'is_today_special')
    list_filter = ('category', 'food_type', 'is_available', 'is_hot_item', 'is_popular', 'is_today_special')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('price', 'is_available', 'is_hot_item', 'is_popular', 'is_today_special')
    inlines = [ProductImageInline]

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" />')
        return "No image"

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'product', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 8px;" />')
        return "No image"
