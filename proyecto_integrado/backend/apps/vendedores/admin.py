from django.contrib import admin

from .models import DisponibilidadVendedor, Vendedor


class DisponibilidadInline(admin.TabularInline):
    model = DisponibilidadVendedor
    extra = 1
    fields = ('dia_semana', 'hora_inicio', 'hora_fin', 'activo')


@admin.register(Vendedor)
class VendedorAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'numero_empleado', 'especialidad', 'activo', 'fecha_ingreso')
    list_filter = ('activo',)
    search_fields = ('usuario__email', 'usuario__first_name', 'numero_empleado')
    raw_id_fields = ('usuario',)
    inlines = [DisponibilidadInline]
