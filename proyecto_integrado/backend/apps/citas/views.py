from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCliente, IsOwnerOrAdmin, IsVendedorOrAdmin

from .models import Cita
from .serializers import CitaClienteSerializer, CitaCreateSerializer, CitaEstatusSerializer, CitaSerializer





class CitaViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    create  → IsCliente
    list    → filtrado por rol (cliente=sus citas, vendedor=sus citas, admin=todas)
    retrieve → IsOwnerOrAdmin
    partial_update (estatus) → IsVendedorOrAdmin
    """

    def get_queryset(self):
        user = self.request.user
        qs = Cita.objects.select_related(
            'cliente', 'vendedor__usuario', 'vehiculo__categoria',
        )
        if user.rol == 'admin':
            return qs
        if user.rol == 'vendedor' and hasattr(user, 'vendedor'):
            return qs.filter(vendedor=user.vendedor)
        # cliente (u otro)
        return qs.filter(cliente=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return CitaCreateSerializer
        if self.action in ('update', 'partial_update'):
            return CitaEstatusSerializer
        if self.request.user.rol == 'cliente':
            return CitaClienteSerializer
        return CitaSerializer

    def create(self, request, *args, **kwargs):
        """Crea la cita con CitaCreateSerializer y devuelve la respuesta con CitaClienteSerializer."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita = serializer.save()
        response_serializer = CitaClienteSerializer(cita, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def get_permissions(self):
        if self.action == 'create':
            return [IsCliente()]
        if self.action in ('update', 'partial_update'):
            return [IsVendedorOrAdmin()]
        if self.action == 'retrieve':
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        if self.action == 'cancelar':
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['patch'], url_path='cancelar')
    def cancelar(self, request, pk=None):
        """El cliente cancela su propia cita pendiente o confirmada."""
        cita = self.get_object()

        # Solo el dueño de la cita o admin puede cancelar
        if request.user.rol != 'admin' and cita.cliente != request.user:
            return Response(
                {'detail': 'No puedes cancelar una cita que no te pertenece.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if cita.estado not in (Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA):
            return Response(
                {'detail': 'Solo se pueden cancelar citas pendientes o confirmadas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cita.estado = Cita.Estado.CANCELADA
        cita.save(update_fields=['estado', 'fecha_actualizacion'])
        return Response({'detail': 'Cita cancelada correctamente.', 'estado': cita.estado})
