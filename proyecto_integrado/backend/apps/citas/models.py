from django.conf import settings
from django.db import models


class Cita(models.Model):
    """
    Cita agendada por un cliente con un vendedor.
    El vehículo es opcional — el cliente puede llegar sin un modelo específico.
    """

    class Estado(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        CONFIRMADA = 'confirmada', 'Confirmada'
        CANCELADA = 'cancelada', 'Cancelada'
        COMPLETADA = 'completada', 'Completada'
        NO_ASISTIO = 'no_asistio', 'No asistió'

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='citas_como_cliente',
        limit_choices_to={'rol': 'cliente'},
    )
    vendedor = models.ForeignKey(
        'vendedores.Vendedor',
        on_delete=models.PROTECT,
        related_name='citas',
    )
    vehiculo = models.ForeignKey(
        'autos.Vehiculo',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='citas',
        help_text='Vehículo de interés. Puede dejarse vacío.',
    )
    fecha_hora = models.DateTimeField(verbose_name='fecha y hora de la cita')
    duracion_minutos = models.PositiveSmallIntegerField(
        default=60,
        help_text='Duración estimada en minutos.',
    )
    estado = models.CharField(
        max_length=12,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    motivo = models.TextField(
        blank=True,
        help_text='Descripción breve de lo que el cliente desea.',
    )
    notas_vendedor = models.TextField(
        blank=True,
        help_text='Notas internas del vendedor tras la cita.',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'cita'
        verbose_name_plural = 'citas'
        ordering = ['fecha_hora']
        constraints = [
            # Evita que el mismo vendedor tenga dos citas exactamente al mismo tiempo
            models.UniqueConstraint(
                fields=['vendedor', 'fecha_hora'],
                name='cita_unica_vendedor_fecha_hora',
            )
        ]

    def __str__(self):
        return (
            f'Cita {self.pk} — {self.cliente.nombre_completo} '
            f'con {self.vendedor} el {self.fecha_hora:%d/%m/%Y %H:%M}'
        )

    @property
    def esta_activa(self):
        return self.estado in (self.Estado.PENDIENTE, self.Estado.CONFIRMADA)

