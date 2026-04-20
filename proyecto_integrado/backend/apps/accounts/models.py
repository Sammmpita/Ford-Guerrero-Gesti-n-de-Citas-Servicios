from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Usuario personalizado. Extiende AbstractUser agregando un campo de rol
    y teléfono. El email se usa como identificador principal de login.
    """

    class Rol(models.TextChoices):
        CLIENTE   = 'cliente',   'Cliente'
        VENDEDOR  = 'vendedor',  'Vendedor'
        ADMIN     = 'admin',     'Administrador'
        ENCARGADO = 'encargado', 'Encargado de Taller'

    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, blank=True)
    rol = models.CharField(
        max_length=10,
        choices=Rol.choices,
        default=Rol.CLIENTE,
    )

    USERNAME_FIELD = 'email'
    # username sigue existiendo (heredado) pero el login usa email
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.get_full_name()} ({self.email})'

    @property
    def nombre_completo(self):
        return self.get_full_name() or self.email

    @property
    def es_cliente(self):
        return self.rol == self.Rol.CLIENTE

    @property
    def es_vendedor(self):
        return self.rol == self.Rol.VENDEDOR

    @property
    def es_admin(self):
        return self.rol == self.Rol.ADMIN


class PerfilCliente(models.Model):
    """
    Información extendida exclusiva del cliente.
    Se crea automáticamente al registrar un usuario con rol=cliente.
    """

    usuario = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='perfil_cliente',
    )
    direccion = models.CharField(max_length=255, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    notas = models.TextField(blank=True, help_text='Notas internas sobre el cliente.')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'perfil de cliente'
        verbose_name_plural = 'perfiles de clientes'

    def __str__(self):
        return f'Perfil de {self.usuario.nombre_completo}'

