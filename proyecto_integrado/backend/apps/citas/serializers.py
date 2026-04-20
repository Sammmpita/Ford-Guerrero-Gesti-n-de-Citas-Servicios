from django.db.models import Count, Q
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.autos.serializers import VehiculoSerializer
from apps.vendedores.models import DisponibilidadVendedor, Vendedor
from apps.vendedores.serializers import VendedorPerfilSerializer

from .models import Cita


class CitaSerializer(serializers.ModelSerializer):
    """Lectura completa con datos anidados del cliente, vendedor y vehículo."""

    cliente = UserSerializer(read_only=True)
    vendedor = VendedorPerfilSerializer(read_only=True)
    vehiculo = VehiculoSerializer(read_only=True)

    class Meta:
        model = Cita
        fields = (
            'id', 'cliente', 'vendedor', 'vehiculo', 'fecha_hora',
            'duracion_minutos', 'estado', 'motivo', 'notas_vendedor',
            'fecha_creacion', 'fecha_actualizacion',
        )


class CitaCreateSerializer(serializers.ModelSerializer):
    """
    Escritura (solo cliente). El vendedor se asigna automáticamente
    según la disponibilidad y la carga de trabajo.
    """

    class Meta:
        model = Cita
        fields = ('vehiculo', 'fecha_hora', 'motivo')

    def validate_fecha_hora(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError('La fecha y hora deben ser futuras.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        validated_data['cliente'] = request.user

        fecha_hora = validated_data['fecha_hora']
        dia_semana = fecha_hora.weekday()  # 0=Lunes
        hora = fecha_hora.time()

        # 1. Vendedores disponibles ese día y a esa hora
        disponibilidades = DisponibilidadVendedor.objects.filter(
            dia_semana=dia_semana,
            hora_inicio__lte=hora,
            hora_fin__gt=hora,
            activo=True,
            vendedor__activo=True,
        ).select_related('vendedor')

        vendedores_ids = disponibilidades.values_list('vendedor_id', flat=True)

        if not vendedores_ids:
            raise serializers.ValidationError(
                {'fecha_hora': 'No hay vendedores disponibles para el horario seleccionado.'}
            )

        # 2. Excluir vendedores que ya tienen cita a esa misma hora
        vendedores_ocupados = Cita.objects.filter(
            vendedor_id__in=vendedores_ids,
            fecha_hora=fecha_hora,
            estado__in=(Cita.Estado.PENDIENTE, Cita.Estado.CONFIRMADA),
        ).values_list('vendedor_id', flat=True)

        vendedores_libres = (
            Vendedor.objects
            .filter(id__in=vendedores_ids)
            .exclude(id__in=vendedores_ocupados)
        )

        if not vendedores_libres.exists():
            raise serializers.ValidationError(
                {'fecha_hora': 'Todos los vendedores disponibles ya tienen cita a esa hora.'}
            )

        # 3. Balanceo de carga: asignar al que tenga menos citas pendientes
        vendedor = (
            vendedores_libres
            .annotate(
                citas_activas=Count(
                    'citas',
                    filter=Q(citas__estado__in=(
                        Cita.Estado.PENDIENTE,
                        Cita.Estado.CONFIRMADA,
                    )),
                )
            )
            .order_by('citas_activas')
            .first()
        )

        validated_data['vendedor'] = vendedor
        return super().create(validated_data)


class CitaEstatusSerializer(serializers.ModelSerializer):
    """Solo para vendedor/admin: actualizar estatus y notas."""

    class Meta:
        model = Cita
        fields = ('estado', 'notas_vendedor')


class CitaClienteSerializer(serializers.ModelSerializer):
    """Lectura ligera para el dashboard del cliente."""

    vendedor_nombre = serializers.SerializerMethodField()
    vehiculo_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Cita
        fields = (
            'id', 'vendedor_nombre', 'vehiculo_nombre', 'fecha_hora',
            'duracion_minutos', 'estado', 'motivo', 'fecha_creacion',
        )

    def get_vendedor_nombre(self, obj):
        return obj.vendedor.usuario.get_full_name() if obj.vendedor else None

    def get_vehiculo_nombre(self, obj):
        if not obj.vehiculo:
            return None
        return f'{obj.vehiculo.marca} {obj.vehiculo.modelo} {obj.vehiculo.anio}'
