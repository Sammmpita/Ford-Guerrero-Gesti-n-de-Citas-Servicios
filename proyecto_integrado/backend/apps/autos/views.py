from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.accounts.permissions import IsAdmin

from .models import CategoriaVehiculo, ImagenVehiculo, Vehiculo
from .serializers import (
    CategoriaVehiculoSerializer,
    ImagenVehiculoSerializer,
    VehiculoCreateSerializer,
    VehiculoSerializer,
)


class VehiculoViewSet(viewsets.ModelViewSet):
    """
    list, retrieve → público (AllowAny).
    create, update, destroy → solo admin.
    """

    queryset = Vehiculo.objects.select_related('categoria').prefetch_related('imagenes')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return VehiculoCreateSerializer
        return VehiculoSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]


class CategoriaViewSet(viewsets.ModelViewSet):
    """
    list → público.
    create, update, destroy → solo admin.
    """

    queryset = CategoriaVehiculo.objects.all()
    serializer_class = CategoriaVehiculoSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAdmin()]


class ImagenVehiculoViewSet(viewsets.ModelViewSet):
    """
    CRUD de imágenes de un vehículo.
    Ruta anidada: /api/autos/vehiculos/<vehiculo_pk>/imagenes/
    """

    serializer_class = ImagenVehiculoSerializer
    permission_classes = (IsAdmin,)
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return ImagenVehiculo.objects.filter(
            vehiculo_id=self.kwargs['vehiculo_pk'],
        )

    def perform_create(self, serializer):
        vehiculo = Vehiculo.objects.get(pk=self.kwargs['vehiculo_pk'])
        serializer.save(vehiculo=vehiculo)
