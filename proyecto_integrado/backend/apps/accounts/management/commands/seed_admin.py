"""
Comando: python manage.py seed_admin

Crea un superusuario con rol='admin' para desarrollo local.
Si ya existe, lo omite sin error.
"""

from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Crea un usuario administrador de desarrollo (admin@ford.com / admin123)'

    def handle(self, *args, **options):
        email = 'admin@ford.com'
        password = 'admin123'

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'El usuario {email} ya existe — omitido.'))
            return

        User.objects.create_superuser(
            username='admin',
            email=email,
            password=password,
            first_name='Admin',
            last_name='Ford',
            rol='admin',
        )
        self.stdout.write(self.style.SUCCESS(
            f'\n  Usuario admin creado:\n'
            f'  Email:    {email}\n'
            f'  Password: {password}\n'
            f'  Rol:      admin\n'
        ))
