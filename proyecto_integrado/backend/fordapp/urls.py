from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Página de inicio (template)
    path('', TemplateView.as_view(template_name='home.html'), name='home'),

    # Admin de Django
    path('admin/', admin.site.urls),

    # ── API REST ──────────────────────────────────────────────────────
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/autos/', include('apps.autos.urls')),
    path('api/citas/', include('apps.citas.urls')),
    path('api/vendedores/', include('apps.vendedores.urls')),

    # ── Módulo de servicio técnico (API REST) ─────────────────────────
    path('api/servicio/', include('apps.servicio.urls')),

    # ── Documentación OpenAPI ─────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
