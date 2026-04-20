from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .permissions import IsAdmin, IsCliente
from .serializers import (
    CreateEncargadoSerializer,
    CreateVendedorSerializer,
    PerfilClienteSerializer,
    RegisterSerializer,
    UserAdminSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/ — Registro público de nuevos clientes."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/accounts/me/ — Datos del usuario autenticado.
    PUT/PATCH              — Actualizar nombre, teléfono, etc.
    """

    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class UserAdminViewSet(viewsets.ModelViewSet):
    """Solo admin: listar usuarios, cambiar roles, activar/desactivar."""

    queryset = User.objects.all().order_by('id')
    serializer_class = UserAdminSerializer
    permission_classes = (IsAdmin,)
    http_method_names = ('get', 'patch', 'head', 'options')


class CreateVendedorView(generics.CreateAPIView):
    """
    POST /api/accounts/crear-vendedor/
    Solo admin. Crea un usuario rol=vendedor y su perfil Vendedor en una sola petición.
    """

    serializer_class = CreateVendedorSerializer
    permission_classes = (IsAdmin,)


class CreateEncargadoView(generics.CreateAPIView):
    """
    POST /api/accounts/crear-encargado/
    Solo admin. Crea un usuario con rol=encargado de taller.
    """

    serializer_class = CreateEncargadoSerializer
    permission_classes = (IsAdmin,)


class PerfilClienteView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/accounts/mi-perfil-cliente/ — Datos extendidos del cliente.
    PATCH /api/accounts/mi-perfil-cliente/ — Actualizar dirección, ciudad.
    """

    serializer_class = PerfilClienteSerializer
    permission_classes = (IsCliente,)

    def get_object(self):
        from .models import PerfilCliente
        perfil, _ = PerfilCliente.objects.get_or_create(usuario=self.request.user)
        return perfil
