from django.db.models import Q
from rest_framework import serializers

from .models import DisponibilidadVendedor, Vendedor
from apps.accounts.serializers import UserSerializer


class DisponibilidadVendedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = DisponibilidadVendedor
        fields = ('id', 'dia_semana', 'hora_inicio', 'hora_fin', 'activo')

    def validate(self, attrs):
        hora_inicio = attrs.get('hora_inicio', getattr(self.instance, 'hora_inicio', None))
        hora_fin = attrs.get('hora_fin', getattr(self.instance, 'hora_fin', None))

        if hora_fin and hora_inicio and hora_fin <= hora_inicio:
            raise serializers.ValidationError(
                {'hora_fin': 'La hora de fin debe ser mayor que la hora de inicio.'}
            )

        # Validar conflicto de horario para el mismo vendedor y día
        vendedor = self.context.get('vendedor')
        dia = attrs.get('dia_semana', getattr(self.instance, 'dia_semana', None))

        if vendedor and dia is not None and hora_inicio and hora_fin:
            conflictos = DisponibilidadVendedor.objects.filter(
                vendedor=vendedor,
                dia_semana=dia,
                activo=True,
            ).filter(
                Q(hora_inicio__lt=hora_fin) & Q(hora_fin__gt=hora_inicio)
            )
            if self.instance:
                conflictos = conflictos.exclude(pk=self.instance.pk)
            if conflictos.exists():
                raise serializers.ValidationError(
                    'Ya existe un bloque de disponibilidad que se traslapa con este horario.'
                )
        return attrs


class VendedorPerfilSerializer(serializers.ModelSerializer):
    """Perfil del vendedor con sus disponibilidades anidadas."""

    usuario = UserSerializer(read_only=True)
    disponibilidades = DisponibilidadVendedorSerializer(many=True, read_only=True)

    class Meta:
        model = Vendedor
        fields = (
            'id', 'usuario', 'numero_empleado', 'especialidad',
            'biografia', 'foto', 'activo', 'fecha_ingreso', 'disponibilidades',
        )


class VendedorPerfilUpdateSerializer(serializers.ModelSerializer):
    """Permite al vendedor autenticado actualizar su perfil profesional propio."""

    class Meta:
        model = Vendedor
        fields = ('id', 'numero_empleado', 'especialidad', 'biografia', 'foto', 'activo', 'fecha_ingreso')
        read_only_fields = ('id', 'numero_empleado', 'activo', 'fecha_ingreso')
