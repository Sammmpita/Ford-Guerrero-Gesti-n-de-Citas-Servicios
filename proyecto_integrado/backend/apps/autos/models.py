from django.db import models


class CategoriaVehiculo(models.Model):
    """Categoría o segmento del vehículo (SUV, Sedan, Pickup, etc.)."""

    nombre = models.CharField(max_length=80, unique=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        verbose_name = 'categoría de vehículo'
        verbose_name_plural = 'categorías de vehículos'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Vehiculo(models.Model):
    """
    Vehículo del catálogo de la agencia.
    Las fotos se gestionan a través del modelo relacionado ImagenVehiculo.
    """

    class Estado(models.TextChoices):
        DISPONIBLE = 'disponible', 'Disponible'
        RESERVADO = 'reservado', 'Reservado'
        VENDIDO = 'vendido', 'Vendido'
        INACTIVO = 'inactivo', 'Inactivo'

    categoria = models.ForeignKey(
        CategoriaVehiculo,
        on_delete=models.PROTECT,
        related_name='vehiculos',
    )
    marca = models.CharField(max_length=80, default='Ford')
    modelo = models.CharField(max_length=100)
    anio = models.PositiveSmallIntegerField(verbose_name='año')
    version = models.CharField(
        max_length=100,
        blank=True,
        help_text='Ej: XLT, Titanium, Raptor.',
    )
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    color = models.CharField(max_length=50, blank=True)
    kilometraje = models.PositiveIntegerField(
        default=0,
        help_text='0 para vehículos nuevos.',
    )
    descripcion = models.TextField(blank=True)
    estado = models.CharField(
        max_length=12,
        choices=Estado.choices,
        default=Estado.DISPONIBLE,
    )
    fecha_publicacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'vehículo'
        verbose_name_plural = 'vehículos'
        ordering = ['-fecha_publicacion']

    def __str__(self):
        return f'{self.marca} {self.modelo} {self.anio} — {self.version}'

    @property
    def imagen_principal(self):
        """Devuelve la primera imagen o None."""
        return self.imagenes.filter(es_principal=True).first() or self.imagenes.first()


class ImagenVehiculo(models.Model):
    """Fotos del vehículo. Puede haber varias; una es la principal."""

    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='imagenes',
    )
    imagen = models.ImageField(upload_to='autos/%Y/%m/')
    es_principal = models.BooleanField(
        default=False,
        help_text='Marcar como foto de portada del vehículo.',
    )
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = 'imagen de vehículo'
        verbose_name_plural = 'imágenes de vehículos'
        ordering = ['-es_principal', 'orden']

    def __str__(self):
        return f'Imagen de {self.vehiculo} (principal={self.es_principal})'

