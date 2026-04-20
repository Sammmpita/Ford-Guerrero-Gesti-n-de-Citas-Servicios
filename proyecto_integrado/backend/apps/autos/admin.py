from django.contrib import admin

from .models import CategoriaVehiculo, ImagenVehiculo, Vehiculo


class ImagenVehiculoInline(admin.TabularInline):
    model = ImagenVehiculo
    extra = 1
    fields = ('imagen', 'es_principal', 'orden')


@admin.register(CategoriaVehiculo)
class CategoriaVehiculoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('marca', 'modelo', 'anio', 'version', 'precio', 'estado', 'categoria')
    list_filter = ('estado', 'categoria', 'marca', 'anio')
    search_fields = ('modelo', 'version', 'color')
    list_editable = ('estado',)
    inlines = [ImagenVehiculoInline]
