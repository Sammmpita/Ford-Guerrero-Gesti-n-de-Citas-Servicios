from datetime import date, timedelta

from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import CitaServicio
from .serializers import (
    CambiarBahiaSerializer,
    CambiarEstatusSerializer,
    CitaServicioAdminSerializer,
    CitaServicioCreateSerializer,
    CitaServicioSerializer,
    ComentarCitaSerializer,
    NotasAdminSerializer,
    CancelarCitaSerializer,
)


def es_admin(user):
    return hasattr(user, 'rol') and user.rol in ('admin', 'encargado')


class CitaServicioViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if es_admin(user):
            return CitaServicio.objects.all().order_by('-fecha', 'hora')
        # Normalizar teléfono: tomar solo los últimos 10 dígitos (elimina +52 u otro prefijo)
        tel_raw = ''.join(filter(str.isdigit, getattr(user, 'telefono', '') or ''))
        telefono = tel_raw[-10:] if len(tel_raw) >= 10 else tel_raw
        return CitaServicio.objects.filter(telefono=telefono).order_by('-fecha', 'hora')

    def get_serializer_class(self):
        if self.action == 'create':
            return CitaServicioCreateSerializer
        if es_admin(self.request.user):
            return CitaServicioAdminSerializer
        return CitaServicioSerializer

    # Asignación automática de bahía según tipo de servicio
    BAHIA_POR_SERVICIO = {
        'Preventivo': 'Express',
        'Frenos':     'Medio',
        'Suspension': 'Medio',
        'Electrico':  'Largo',
        'Otro':       'Contingencia',
    }

    def create(self, request, *args, **kwargs):
        serializer = CitaServicioCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        servicio = serializer.validated_data.get('servicio', '')
        bahia = self.BAHIA_POR_SERVICIO.get(servicio, 'Express')
        cita = serializer.save(bahia_asignada=bahia)
        return Response(CitaServicioSerializer(cita).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='cancelar')
    def cancelar(self, request, pk=None):
        cita = self.get_object()
        if cita.estatus not in ['Pendiente', 'En Proceso']:
            return Response(
                {'detail': 'Solo se pueden cancelar citas pendientes o en proceso.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = CancelarCitaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        motivo = serializer.validated_data.get('motivo', '').strip()
        cita.estatus = 'Cancelado'
        cita.motivo_cancelacion = motivo if motivo else 'Sin motivo especificado.'
        cita.save()
        return Response(CitaServicioSerializer(cita).data)

    @action(detail=True, methods=['post'], url_path='comentar')
    def comentar(self, request, pk=None):
        cita = self.get_object()
        if cita.estatus != 'Terminado':
            return Response(
                {'detail': 'Solo se puede comentar una cita terminada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = ComentarCitaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita.comentario_cliente = serializer.validated_data['comentario']
        cita.save()
        return Response(CitaServicioSerializer(cita).data)

    @action(detail=True, methods=['patch'], url_path='estatus')
    def cambiar_estatus(self, request, pk=None):
        if not es_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        cita = self.get_object()
        if cita.estatus == 'Cancelado':
            return Response(
                {'detail': 'No se puede cambiar el estatus de una cita cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = CambiarEstatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita.estatus = serializer.validated_data['estatus']
        cita.save()
        return Response(CitaServicioAdminSerializer(cita).data)

    @action(detail=True, methods=['patch'], url_path='bahia')
    def cambiar_bahia(self, request, pk=None):
        if not es_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        cita = self.get_object()
        serializer = CambiarBahiaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita.bahia_asignada = serializer.validated_data['bahia']
        cita.save()
        return Response(CitaServicioAdminSerializer(cita).data)

    @action(detail=True, methods=['patch'], url_path='notas')
    def guardar_notas(self, request, pk=None):
        if not es_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        cita = self.get_object()
        serializer = NotasAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita.notas_admin = serializer.validated_data['notas_admin']
        cita.save()
        return Response(CitaServicioAdminSerializer(cita).data)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        if not es_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        fecha_str = request.query_params.get('fecha')
        try:
            fecha_actual = date.fromisoformat(fecha_str) if fecha_str else date.today()
        except ValueError:
            fecha_actual = date.today()

        citas_dia = CitaServicio.objects.filter(fecha=fecha_actual)
        bahias = {
            'Express': CitaServicioAdminSerializer(citas_dia.filter(bahia_asignada='Express').order_by('hora'), many=True).data,
            'Medio': CitaServicioAdminSerializer(citas_dia.filter(bahia_asignada='Medio').order_by('hora'), many=True).data,
            'Largo': CitaServicioAdminSerializer(citas_dia.filter(bahia_asignada='Largo').order_by('hora'), many=True).data,
            'Contingencia': CitaServicioAdminSerializer(citas_dia.filter(bahia_asignada='Contingencia').order_by('hora'), many=True).data,
        }
        return Response({
            'fecha': fecha_actual.isoformat(),
            'fecha_previa': (fecha_actual - timedelta(days=1)).isoformat(),
            'fecha_siguiente': (fecha_actual + timedelta(days=1)).isoformat(),
            'bahias': bahias,
            'totales': {k: len(v) for k, v in bahias.items()},
        })

    @action(detail=False, methods=['get'], url_path='buscar')
    def buscar(self, request):
        if not es_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response([])
        citas = CitaServicio.objects.filter(
            Q(cliente__icontains=q) | Q(placas__icontains=q)
        ).order_by('-fecha', 'hora')
        return Response(CitaServicioAdminSerializer(citas, many=True).data)
