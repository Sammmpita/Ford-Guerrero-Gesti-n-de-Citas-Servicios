from django.contrib import admin

from .models import Cita


@admin.register(Cita)
class CitaAdmin(admin.ModelAdmin):
    list_display = ('pk', 'cliente', 'vendedor', 'vehiculo', 'fecha_hora', 'estado')
    list_filter = ('estado', 'fecha_hora', 'vendedor')
    search_fields = ('cliente__email', 'cliente__first_name', 'vendedor__usuario__email')
    raw_id_fields = ('cliente', 'vendedor', 'vehiculo')
    date_hierarchy = 'fecha_hora'
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
