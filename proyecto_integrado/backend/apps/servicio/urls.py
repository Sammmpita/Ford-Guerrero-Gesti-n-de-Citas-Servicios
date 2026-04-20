from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CitaServicioViewSet

app_name = 'servicio'

router = DefaultRouter()
router.register('citas', CitaServicioViewSet, basename='servicio-citas')

urlpatterns = [
    path('', include(router.urls)),
]
