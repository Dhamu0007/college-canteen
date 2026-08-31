from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="EM BABU THINNAVA? API",
        default_version='v1',
        description="College Canteen Management Platform API",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@embabuthinnava.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'name': 'EM BABU THINNAVA? API Server',
        'status': 'running',
        'frontend_url': 'http://localhost:5173',
        'swagger_docs': '/api/docs/',
        'redoc_docs': '/api/redoc/',
        'admin_panel': '/admin/'
    })

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/coupons/', include('coupons.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/delivery/', include('delivery.urls')),
    
    path(
        'api/docs/',
        schema_view.with_ui('swagger', cache_timeout=0),
        name='schema-swagger-ui'
    ),

    path(
        'api/redoc/',
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc'
    ),
]

# Serve uploaded media files
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)

# Serve static files only during development
if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )