from django.contrib import admin
from .models import CitaServicio

@admin.register(CitaServicio)
class CitaServicioAdmin(admin.ModelAdmin):
    
    list_display = ('id', 'cliente', 'placas', 'servicio', 'fecha', 'hora', 'estatus')
    
    #Permitir cambiar el estatus directamente desde la lista
    list_editable = ('estatus',)
    
    #Filtros laterales para organizar por día o estado del vehículo
    list_filter = ('estatus', 'fecha', 'servicio')
    
    #Buscador por placas o nombre del cliente
    search_fields = ('placas', 'cliente', 'telefono')
    
    #Ordenar por las citas más recientes primero
    ordering = ('-fecha', '-hora')

    #Organizar los detalles dentro de la ficha de la cita
    fieldsets = (
        ('Información del Cliente', {
            'fields': ('cliente', 'telefono')
        }),
        ('Detalles del Vehículo', {
            'fields': ('modelo_auto', 'placas')
        }),
        ('Servicio y Seguimiento', {
            'fields': ('servicio', 'detalles_falla', 'fecha', 'hora', 'estatus')
        }),
    )

    # Hacer que ciertos campos sean de solo lectura si ya pasó la fecha (opcional)
    # readonly_fields = ('fecha', 'hora')