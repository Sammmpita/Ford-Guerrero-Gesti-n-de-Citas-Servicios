from django.db import models

class CitaServicio(models.Model):
    # opciones para el tipo de servicio
    OPCIONES_SERVICIO = [
        ('Preventivo', 'Mantenimiento Preventivo'),
        ('Frenos', 'Sistema de Frenos'),
        ('Suspension', 'Suspensión'),
        ('Electrico', 'Sistema Eléctrico'),
        ('Otro', 'Otro (Especificar)'),
    ]

    # opciones para el estatus de la cita
    OPCIONES_ESTATUS = [
        ('Pendiente', 'Pendiente'),
        ('En Proceso', 'En Proceso'),
        ('Terminado', 'Terminado'),
        ('Cancelado', 'Cancelado'),
    ]

    # opciones para la bahia del taller
    OPCIONES_BAHIA = [
        ('Express', 'Alta (Express)'),
        ('Medio', 'Media'),
        ('Largo', 'Baja (Largo Plazo)'),
        ('Contingencia', 'Contingencia'),
    ]

    # datos del cliente y su vehiculo
    cliente = models.CharField(max_length=100)
    telefono = models.CharField(max_length=10)
    modelo_auto = models.CharField(max_length=50)
    placas = models.CharField(max_length=15)

    # datos de la cita
    servicio = models.CharField(max_length=100, choices=OPCIONES_SERVICIO)
    detalles_falla = models.TextField(blank=True, null=True)
    fecha = models.DateField()
    hora = models.TimeField()

    # campos que maneja el taller internamente
    estatus = models.CharField(max_length=20, choices=OPCIONES_ESTATUS, default='Pendiente')
    bahia_asignada = models.CharField(max_length=20, choices=OPCIONES_BAHIA, default='Express')
    notas_admin = models.TextField(blank=True, null=True)

    # campos que llena el cliente
    motivo_cancelacion = models.TextField(blank=True, null=True)
    comentario_cliente = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'cita de servicio'
        verbose_name_plural = 'citas de servicio'

    def __str__(self):
        return f"{self.cliente} - {self.placas} ({self.fecha})"
