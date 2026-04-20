from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PerfilCliente, User


@receiver(post_save, sender=User)
def crear_perfil_cliente(sender, instance, created, **kwargs):
    """Crea automáticamente un PerfilCliente cuando se registra un usuario con rol=cliente."""
    if created and instance.rol == User.Rol.CLIENTE:
        PerfilCliente.objects.get_or_create(usuario=instance)
