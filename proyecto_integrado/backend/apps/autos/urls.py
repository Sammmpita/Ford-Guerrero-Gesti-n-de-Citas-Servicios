from django.urls import include, path
from rest_framework.routers import DefaultRouter, SimpleRouter

from .views import CategoriaViewSet, ImagenVehiculoViewSet, VehiculoViewSet

app_name = 'autos'

router = DefaultRouter()
router.register('vehiculos', VehiculoViewSet, basename='vehiculos')
router.register('categorias', CategoriaViewSet, basename='categorias')

imagen_router = SimpleRouter()
imagen_router.register('imagenes', ImagenVehiculoViewSet, basename='vehiculo-imagenes')

urlpatterns = [
    path('', include(router.urls)),
    path('vehiculos/<int:vehiculo_pk>/', include(imagen_router.urls)),
]
