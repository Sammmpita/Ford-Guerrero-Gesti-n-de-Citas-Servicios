import datetime

from django.utils import timezone
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsVendedor
from apps.citas.models import Cita

from .models import DisponibilidadVendedor, Vendedor
from .serializers import (
    DisponibilidadVendedorSerializer,
    VendedorPerfilSerializer,
    VendedorPerfilUpdateSerializer,
)


class VendedorPublicoViewSet(viewsets.ReadOnlyModelViewSet):
    """Lista pública de vendedores activos (solo lectura)."""

    queryset = Vendedor.objects.filter(activo=True).select_related('usuario')
    serializer_class = VendedorPerfilSerializer
    permission_classes = (AllowAny,)


class DisponibilidadViewSet(viewsets.ModelViewSet):
    """
    CRUD de disponibilidades del vendedor autenticado.
    Solo el vendedor dueño ve y modifica sus propios bloques.
    """

    serializer_class = DisponibilidadVendedorSerializer
    permission_classes = (IsVendedor,)

    def get_queryset(self):
        return DisponibilidadVendedor.objects.filter(
            vendedor__usuario=self.request.user,
        ).order_by('dia_semana', 'hora_inicio')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.user.is_authenticated and hasattr(self.request.user, 'vendedor'):
            ctx['vendedor'] = self.request.user.vendedor
        return ctx

    def perform_create(self, serializer):
        serializer.save(vendedor=self.request.user.vendedor)


class MiPerfilVendedorView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/vendedores/mi-perfil/ — Perfil profesional propio del vendedor.
    PATCH                            — Actualizar especialidad, biografía y foto.
    """

    serializer_class = VendedorPerfilUpdateSerializer
    permission_classes = (IsVendedor,)

    def get_object(self):
        return self.request.user.vendedor


class EstadisticasVendedorView(APIView):
    """GET /api/vendedores/estadisticas/ — KPIs del vendedor autenticado."""

    permission_classes = (IsVendedor,)

    def get(self, request):
        vendedor = request.user.vendedor
        hoy = timezone.localdate()
        inicio_mes = hoy.replace(day=1)

        citas_qs = Cita.objects.filter(vendedor=vendedor)

        pendientes = citas_qs.filter(estado=Cita.Estado.PENDIENTE).count()
        confirmadas = citas_qs.filter(estado=Cita.Estado.CONFIRMADA).count()
        hoy_count = citas_qs.filter(
            fecha_hora__date=hoy,
            estado__in=(Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA),
        ).count()
        completadas_mes = citas_qs.filter(
            estado=Cita.Estado.COMPLETADA,
            fecha_hora__date__gte=inicio_mes,
        ).count()

        proximas = (
            citas_qs
            .filter(
                estado__in=(Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA),
                fecha_hora__gte=timezone.now(),
            )
            .select_related('cliente', 'vehiculo')
            .order_by('fecha_hora')[:5]
        )

        proximas_data = [
            {
                'id': c.id,
                'cliente': f'{c.cliente.first_name} {c.cliente.last_name}'.strip() or c.cliente.email,
                'vehiculo': str(c.vehiculo) if c.vehiculo else None,
                'fecha_hora': c.fecha_hora.isoformat(),
                'estado': c.estado,
            }
            for c in proximas
        ]

        return Response({
            'citas_pendientes': pendientes,
            'citas_confirmadas': confirmadas,
            'citas_hoy': hoy_count,
            'citas_completadas_mes': completadas_mes,
            'proximas_citas': proximas_data,
        })


class HorasDisponiblesView(APIView):
    """
    GET /api/vendedores/horas-disponibles/?fecha=YYYY-MM-DD

    Devuelve los slots de hora (cada 60 min) en los que al menos un
    vendedor activo tiene disponibilidad y todavía hay cupo (no está
    ocupado por otra cita no-cancelada).

    Acceso público — no requiere autenticación.
    """

    permission_classes = (AllowAny,)

    def get(self, request):
        fecha_str = request.query_params.get('fecha', '')
        if not fecha_str:
            return Response({'detail': 'El parámetro "fecha" es obligatorio.'}, status=400)

        try:
            fecha = datetime.date.fromisoformat(fecha_str)
        except ValueError:
            return Response({'detail': 'Formato de fecha inválido. Usa YYYY-MM-DD.'}, status=400)

        hoy = timezone.localdate()
        if fecha < hoy:
            return Response({'detail': 'No se pueden consultar fechas pasadas.'}, status=400)

        # weekday(): 0=lunes … 6=domingo — igual que DiaSemana en el modelo
        dia_semana = fecha.weekday()

        bloques = DisponibilidadVendedor.objects.filter(
            dia_semana=dia_semana,
            activo=True,
            vendedor__activo=True,
        ).select_related('vendedor')

        if not bloques.exists():
            return Response({'horas': []})

        # Generar slots por hora para cada bloque y registrar cuántos
        # vendedores cubren cada slot: {hora_str: set(vendedor_id)}
        # Se resta 1 hora al hora_fin para evitar que el cliente agende
        # en la última hora del turno del asesor.
        slots_vendedores: dict[str, set] = {}
        for bloque in bloques:
            hora_actual = datetime.datetime.combine(fecha, bloque.hora_inicio)
            hora_fin = datetime.datetime.combine(fecha, bloque.hora_fin) - datetime.timedelta(hours=1)
            while hora_actual < hora_fin:
                key = hora_actual.strftime('%H:%M')
                slots_vendedores.setdefault(key, set()).add(bloque.vendedor_id)
                hora_actual += datetime.timedelta(hours=1)

        if not slots_vendedores:
            return Response({'horas': []})

        # Obtener citas ya ocupadas en esa fecha (estados no-cancelados)
        citas_ocupadas = Cita.objects.filter(
            fecha_hora__date=fecha,
        ).exclude(
            estado=Cita.Estado.CANCELADA,
        ).values_list('fecha_hora', 'vendedor_id')

        # Contar citas por slot (independiente del vendedor, para simplificar)
        citas_por_slot: dict[str, int] = {}
        for fecha_hora, _ in citas_ocupadas:
            # fecha_hora es un datetime aware; extraemos la hora local
            hora_local = timezone.localtime(fecha_hora).strftime('%H:%M')
            citas_por_slot[hora_local] = citas_por_slot.get(hora_local, 0) + 1

        # Un slot es disponible si: vendedores_con_bloque > citas_en_ese_slot
        horas_disponibles = sorted([
            hora
            for hora, vendedor_ids in slots_vendedores.items()
            if len(vendedor_ids) > citas_por_slot.get(hora, 0)
        ])

        return Response({'horas': horas_disponibles})
