from rest_framework import serializers
from .models import CitaServicio


class CitaServicioSerializer(serializers.ModelSerializer):
    """Serializer completo para lectura."""

    class Meta:
        model = CitaServicio
        fields = (
            'id', 'cliente', 'telefono', 'modelo_auto', 'placas',
            'servicio', 'detalles_falla', 'fecha', 'hora',
            'estatus', 'bahia_asignada', 'notas_admin',
            'motivo_cancelacion', 'comentario_cliente',
        )
        read_only_fields = ('estatus', 'bahia_asignada', 'notas_admin', 'motivo_cancelacion')


class CitaServicioCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear una cita de servicio."""

    class Meta:
        model = CitaServicio
        fields = (
            'cliente', 'telefono', 'modelo_auto', 'placas',
            'servicio', 'detalles_falla', 'fecha', 'hora',
        )

    def validate_telefono(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError('El teléfono debe tener exactamente 10 dígitos.')
        return value

    def validate_placas(self, value):
        placas = value.upper().strip()
        if not placas.isalnum() or len(placas) > 7:
            raise serializers.ValidationError(
                'Las placas deben tener máximo 7 caracteres alfanuméricos (solo letras y números).'
            )
        return placas

    def validate(self, data):
        placas = data.get('placas', '').upper().strip()
        data['placas'] = placas
        # no puede haber dos citas activas para el mismo vehículo
        activa = CitaServicio.objects.filter(
            placas=placas
        ).exclude(estatus='Terminado').exclude(estatus='Cancelado').exists()
        if activa:
            raise serializers.ValidationError(
                {'placas': f'El vehículo {placas} ya tiene un servicio activo.'}
            )
        return data


class CitaServicioAdminSerializer(serializers.ModelSerializer):
    """Serializer para el admin — incluye todos los campos."""

    class Meta:
        model = CitaServicio
        fields = '__all__'


class CambiarEstatusSerializer(serializers.Serializer):
    estatus = serializers.ChoiceField(choices=[
        'Pendiente', 'En Proceso', 'Terminado', 'Cancelado'
    ])


class CambiarBahiaSerializer(serializers.Serializer):
    bahia = serializers.ChoiceField(choices=[
        'Express', 'Medio', 'Largo', 'Contingencia'
    ])


class NotasAdminSerializer(serializers.Serializer):
    notas_admin = serializers.CharField(allow_blank=True)


class CancelarCitaSerializer(serializers.Serializer):
    motivo = serializers.CharField(allow_blank=True, required=False)


class ComentarCitaSerializer(serializers.Serializer):
    comentario = serializers.CharField()
