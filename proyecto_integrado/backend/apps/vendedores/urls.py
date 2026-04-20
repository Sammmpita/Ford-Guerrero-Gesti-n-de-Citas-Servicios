from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    DisponibilidadViewSet,
    EstadisticasVendedorView,
    HorasDisponiblesView,
    MiPerfilVendedorView,
    VendedorPublicoViewSet,
)

app_name = 'vendedores'

router = DefaultRouter()
router.register('lista', VendedorPublicoViewSet, basename='lista')
router.register('disponibilidad', DisponibilidadViewSet, basename='disponibilidad')

urlpatterns = [
    path('mi-perfil/', MiPerfilVendedorView.as_view(), name='mi-perfil'),
    path('estadisticas/', EstadisticasVendedorView.as_view(), name='estadisticas'),
    path('horas-disponibles/', HorasDisponiblesView.as_view(), name='horas-disponibles'),
    path('', include(router.urls)),
]
