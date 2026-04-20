"""
Comando personalizado: python manage.py devserver

Muestra un banner informativo con el estado del proyecto
antes de arrancar el servidor de desarrollo de Django.
"""

import sys
import django
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Inicia el servidor de desarrollo con información detallada del proyecto."

    def add_arguments(self, parser):
        parser.add_argument(
            "addrport",
            nargs="?",
            default="127.0.0.1:8000",
            help="Dirección y puerto (default: 127.0.0.1:8000)",
        )
        parser.add_argument(
            "--noreload",
            action="store_true",
            help="Desactiva el auto-reload.",
        )

    def handle(self, *args, **options):
        self._print_banner(options["addrport"])
        sys.stdout.flush()
        sys.stderr.flush()
        call_command(
            "runserver",
            options["addrport"],
            use_reloader=not options["noreload"],
            verbosity=options["verbosity"],
        )

    # ------------------------------------------------------------------
    # Banner
    # ------------------------------------------------------------------

    def _print_banner(self, addrport: str) -> None:
        W = self.style.WARNING
        S = self.style.SUCCESS
        E = self.style.ERROR
        N = self.style.NOTICE
        M = self.style.MIGRATE_HEADING

        sep = self.style.HTTP_INFO("─" * 58)

        self.stdout.write("")
        self.stdout.write(sep)
        self.stdout.write(W("  FORD — Sistema de Agendado de Citas"))
        self.stdout.write(sep)

        # Django / Python
        self.stdout.write(S(f"  Django  ") + f"v{django.get_version()}")
        self.stdout.write(S(f"  Python  ") + f"v{sys.version.split()[0]}")

        # Modo
        debug_label = E("  DEBUG   ON  ⚠  (no usar en producción)") if settings.DEBUG else S("  DEBUG   OFF ✓")
        self.stdout.write(debug_label)

        # Base de datos
        db = settings.DATABASES.get("default", {})
        db_engine = db.get("ENGINE", "").split(".")[-1]
        db_name   = db.get("NAME", "")
        self.stdout.write(N(f"  DB      ") + f"{db_engine}  →  {db_name}")

        # Apps locales
        self.stdout.write("")
        self.stdout.write(M("  Apps registradas"))
        local_apps = [a for a in settings.INSTALLED_APPS if a.startswith("apps.")]
        for app in local_apps:
            self.stdout.write(f"    ✓  {app}")

        # URLs principales
        self.stdout.write("")
        self.stdout.write(M("  URLs disponibles"))
        host = addrport if addrport.startswith("http") else f"http://{addrport}"
        routes = [
            ("Inicio",      "/"),
            ("Admin",       "/admin/"),
            ("Accounts",    "/accounts/"),
            ("Autos",       "/autos/"),
            ("Citas",       "/citas/"),
            ("Vendedores",  "/vendedores/"),
        ]
        for label, path in routes:
            self.stdout.write(f"    {label:<12}  {host}{path}")

        # Medios / estáticos
        self.stdout.write("")
        self.stdout.write(M("  Archivos"))
        self.stdout.write(f"    STATIC_URL   {settings.STATIC_URL}")
        self.stdout.write(f"    MEDIA_URL    {settings.MEDIA_URL}")
        self.stdout.write(f"    MEDIA_ROOT   {settings.MEDIA_ROOT}")

        self.stdout.write("")
        self.stdout.write(sep)
        self.stdout.write(S(f"  Servidor arrancando en  {host}"))
        self.stdout.write(sep)
        self.stdout.write("")
