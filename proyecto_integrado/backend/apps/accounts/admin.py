from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import PerfilCliente, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'rol', 'is_active')
    list_filter = ('rol', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('last_name', 'first_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('telefono', 'rol')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('email', 'telefono', 'rol')}),
    )


@admin.register(PerfilCliente)
class PerfilClienteAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'ciudad', 'fecha_creacion')
    search_fields = ('usuario__email', 'usuario__first_name', 'ciudad')
    raw_id_fields = ('usuario',)
