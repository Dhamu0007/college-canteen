from django.urls import path
from .views import (
    OrderListView, OrderDetailView, CreateOrderView,
    UpdateOrderStatusView, CancelOrderView,
    CartView, AddToCartView, UpdateCartItemView,
    RemoveFromCartView, ClearCartView,
    OrderStatusHistoryView
)

urlpatterns = [
    # Cart endpoints (must be defined before <str:order_number>/ to avoid wildcard matching)
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add_to_cart'),
    path('cart/item/<int:item_id>/', UpdateCartItemView.as_view(), name='update_cart_item'),
    path('cart/item/<int:item_id>/remove/', RemoveFromCartView.as_view(), name='remove_from_cart'),
    path('cart/clear/', ClearCartView.as_view(), name='clear_cart'),

    # Order endpoints
    path('', OrderListView.as_view(), name='orders'),
    path('create/', CreateOrderView.as_view(), name='create_order'),
    path('<str:order_number>/', OrderDetailView.as_view(), name='order_detail'),
    path('<str:order_number>/status/', UpdateOrderStatusView.as_view(), name='update_order_status'),
    path('<str:order_number>/cancel/', CancelOrderView.as_view(), name='cancel_order'),
    path('<str:order_number>/history/', OrderStatusHistoryView.as_view(), name='order_history'),
]