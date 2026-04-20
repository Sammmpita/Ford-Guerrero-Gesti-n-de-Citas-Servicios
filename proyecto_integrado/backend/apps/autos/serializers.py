from rest_framework import serializers

from .models import CategoriaVehiculo, ImagenVehiculo, Vehiculo


class CategoriaVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaVehiculo
        fields = ('id', 'nombre', 'descripcion')


class ImagenVehiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenVehiculo
        fields = ('id', 'imagen', 'es_principal', 'orden')


class VehiculoSerializer(serializers.ModelSerializer):
    """Lectura — incluye categoría e imágenes anidadas."""

    categoria = CategoriaVehiculoSerializer(read_only=True)
    imagenes = ImagenVehiculoSerializer(many=True, read_only=True)

    class Meta:
        model = Vehiculo
        fields = (
            'id', 'categoria', 'marca', 'modelo', 'anio', 'version',
            'precio', 'color', 'kilometraje', 'descripcion', 'estado',
            'imagenes', 'fecha_publicacion', 'fecha_actualizacion',
        )


class VehiculoCreateSerializer(serializers.ModelSerializer):
    """Escritura — para que admin cree/edite vehículos."""

    class Meta:
        model = Vehiculo
        fields = (
            'id', 'categoria', 'marca', 'modelo', 'anio', 'version',
            'precio', 'color', 'kilometraje', 'descripcion', 'estado',
        )
