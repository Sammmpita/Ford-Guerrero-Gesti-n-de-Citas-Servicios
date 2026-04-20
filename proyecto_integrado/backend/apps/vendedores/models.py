from django.conf import settings
from django.db import models


class Vendedor(models.Model):
    """
    Perfil de vendedor vinculado 1-a-1 con un User (rol=vendedor).
    Centraliza la información laboral del asesor de ventas.
    """

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendedor',
        limit_choices_to={'rol': 'vendedor'},
    )
    numero_empleado = models.CharField(max_length=20, unique=True)
    especialidad = models.CharField(
        max_length=120,
        blank=True,
        help_text='Ej: SUVs, Pickups, Vehículos eléctricos.',
    )
    biografia = models.TextField(blank=True)
    foto = models.ImageField(upload_to='vendedores/', blank=True)
    activo = models.BooleanField(default=True)
    fecha_ingreso = models.DateField()

    class Meta:
        verbose_name = 'vendedor'
        verbose_name_plural = 'vendedores'
        ordering = ['usuario__last_name', 'usuario__first_name']

    def __str__(self):
        return f'{self.usuario.nombre_completo} (#{self.numero_empleado})'


class DisponibilidadVendedor(models.Model):
    """
    Bloque de horario disponible de un vendedor para recibir citas.
    Un vendedor puede tener múltiples bloques por día o semana.
    """

    class DiaSemana(models.IntegerChoices):
        LUNES = 0, 'Lunes'
        MARTES = 1, 'Martes'
        MIERCOLES = 2, 'Miércoles'
        JUEVES = 3, 'Jueves'
        VIERNES = 4, 'Viernes'
        SABADO = 5, 'Sábado'
        DOMINGO = 6, 'Domingo'

    vendedor = models.ForeignKey(
        Vendedor,
        on_delete=models.CASCADE,
        related_name='disponibilidades',
    )
    dia_semana = models.IntegerField(choices=DiaSemana.choices)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    activo = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'disponibilidad de vendedor'
        verbose_name_plural = 'disponibilidades de vendedores'
        ordering = ['dia_semana', 'hora_inicio']
        constraints = [
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F('hora_inicio')),
                name='hora_fin_mayor_que_inicio',
            )
        ]

    def __str__(self):
        dia = self.get_dia_semana_display()
        return f'{self.vendedor} — {dia} {self.hora_inicio:%H:%M}–{self.hora_fin:%H:%M}'

