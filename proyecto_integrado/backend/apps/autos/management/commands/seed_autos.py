"""
Management command: seed_autos
Pobla la base de datos con los vehículos reales del catálogo Ford México 2025.
Es idempotente: si el vehículo ya existe (por marca + modelo + año + versión)
lo actualiza; si la imagen ya existe, la omite.

Las imágenes se obtienen desde la API de Wikipedia (pageimages), que devuelve
URLs verificadas de Wikimedia Commons en alta resolución.

Uso:
    python manage.py seed_autos
    python manage.py seed_autos --sin-imagenes   # omite la descarga de fotos
    python manage.py seed_autos --limpiar        # borra todo y reinicia
"""

import json
import os
import ssl
import tempfile
import time
import urllib.parse
import urllib.request
from decimal import Decimal

from django.core.files import File
from django.core.management.base import BaseCommand

from apps.autos.models import CategoriaVehiculo, ImagenVehiculo, Vehiculo

# ---------------------------------------------------------------------------
# Categorías
# ---------------------------------------------------------------------------
CATEGORIAS = [
    {"nombre": "Pickup",     "descripcion": "Camionetas de trabajo y aventura."},
    {"nombre": "SUV",        "descripcion": "Vehículos utilitarios deportivos."},
    {"nombre": "Crossover",  "descripcion": "Crossovers compactos y versátiles."},
    {"nombre": "Deportivo",  "descripcion": "Vehículos de alto rendimiento."},
    {"nombre": "Eléctrico",  "descripcion": "Vehículos 100 % eléctricos o híbridos enchufables."},
    {"nombre": "Aventura",   "descripcion": "Diseñados para el terreno más exigente."},
]

# ---------------------------------------------------------------------------
# Catálogo Ford México 2025
# ---------------------------------------------------------------------------
# "wikipedia" → título del artículo en Wikipedia en inglés.
# La imagen se obtiene automáticamente via la API pageimages de Wikipedia,
# que devuelve URLs verificadas y existentes de Wikimedia Commons.
# Si la descarga falla el vehículo igual se crea, sin foto.
# ---------------------------------------------------------------------------
VEHICULOS = [
    # -- PICKUPS -------------------------------------------------------------
    {
        "categoria": "Pickup",
        "modelo": "Maverick",
        "anio": 2025,
        "version": "XL FWD",
        "precio": Decimal("479900.00"),
        "color": "Blanco Platino",
        "descripcion": (
            "La pickup compacta más accesible de Ford. "
            "Motor EcoBoost 2.5L híbrido estándar, 191 hp, "
            "hasta 13.5 km/L en ciudad. Ideal para uso diario y trabajo ligero."
        ),
        "wikipedia": "Ford_Maverick_(pickup_truck)",
    },
    {
        "categoria": "Pickup",
        "modelo": "Maverick",
        "anio": 2025,
        "version": "XLT AWD",
        "precio": Decimal("529900.00"),
        "color": "Azul Velocidad",
        "descripcion": (
            "Maverick XLT con tracción total y motor EcoBoost 2.0L turbo, 250 hp. "
            "Caja de 1.5 m, conectividad SYNC 4 y carga inalámbrica."
        ),
        "wikipedia": "Ford_Maverick_(pickup_truck)",
    },
    {
        "categoria": "Pickup",
        "modelo": "F-150",
        "anio": 2025,
        "version": "XL 4×2",
        "precio": Decimal("748900.00"),
        "color": "Blanco Oxford",
        "descripcion": (
            "La camioneta más vendida en México. "
            "Motor V6 3.3L, 290 hp, carga máxima 1,087 kg y remolque hasta 5,625 kg."
        ),
        "wikipedia": "Ford_F-Series",
    },
    {
        "categoria": "Pickup",
        "modelo": "F-150",
        "anio": 2025,
        "version": "XLT 4×4",
        "precio": Decimal("899900.00"),
        "color": "Gris Carbonizado",
        "descripcion": (
            "F-150 XLT con tracción total, motor EcoBoost 2.7L biturbo, 325 hp. "
            "Caja de aluminio, suspensión independiente trasera y Pro Power Onboard."
        ),
        "wikipedia": "Ford_F-Series",
    },
    {
        "categoria": "Pickup",
        "modelo": "F-150",
        "anio": 2025,
        "version": "Lariat 4×4",
        "precio": Decimal("1099900.00"),
        "color": "Azul Antimatter",
        "descripcion": (
            "F-150 Lariat con motor EcoBoost 3.5L biturbo, 400 hp. "
            "Asientos de cuero, techo corredizo, B&O Sound System y FordPass Connect."
        ),
        "wikipedia": "Ford_F-Series",
    },
    {
        "categoria": "Aventura",
        "modelo": "F-150 Raptor",
        "anio": 2025,
        "version": "R",
        "precio": Decimal("1599900.00"),
        "color": "Rojo Carrera",
        "descripcion": (
            "El monstruo del desierto. Motor High Output EcoBoost 3.5L, 450 hp, "
            "suspensión Fox de 5 vías, eje trasero de bloqueo electrónico y modos "
            "de conducción Baja, Rock Crawl y más."
        ),
        "wikipedia": "Ford_F-150_Raptor",
    },
    # -- SUVs ----------------------------------------------------------------
    {
        "categoria": "SUV",
        "modelo": "Territory",
        "anio": 2025,
        "version": "Titanium",
        "precio": Decimal("679900.00"),
        "color": "Blanco Platino",
        "descripcion": (
            "SUV compacto con motor 1.5L EcoBoost 160 hp, transmisión automática 7 vel. "
            "SYNC 3, cámara 360°, sensores de estacionamiento y techo panorámico."
        ),
        "wikipedia": "Ford_Territory_(China)",
    },
    {
        "categoria": "SUV",
        "modelo": "Explorer",
        "anio": 2025,
        "version": "XLT 4×4",
        "precio": Decimal("879900.00"),
        "color": "Negro Agate",
        "descripcion": (
            "SUV familiar de 7 plazas con motor EcoBoost 2.3L, 300 hp, "
            "tracción total inteligente y sistema de gestión de terreno."
        ),
        "wikipedia": "Ford_Explorer",
    },
    {
        "categoria": "SUV",
        "modelo": "Explorer",
        "anio": 2025,
        "version": "Platinum 4×4",
        "precio": Decimal("1299900.00"),
        "color": "Plata Estrella",
        "descripcion": (
            "La versión más equipada del Explorer: motor V6 3.0L EcoBoost 400 hp, "
            "asientos de cuero Nirvana, B&O Sound System de 14 bocinas y Active Park Assist."
        ),
        "wikipedia": "Ford_Explorer",
    },
    # -- CROSSOVERS ----------------------------------------------------------
    {
        "categoria": "Crossover",
        "modelo": "Bronco Sport",
        "anio": 2025,
        "version": "Big Bend",
        "precio": Decimal("779900.00"),
        "color": "Azul Velocidad",
        "descripcion": (
            "Crossover todoterreno con motor EcoBoost 1.5L, 181 hp, "
            "tracción total GoatMode™ con 7 modos de conducción. "
            "Diseño robusto con techo de acero removible."
        ),
        "wikipedia": "Ford_Bronco_Sport",
    },
    {
        "categoria": "Crossover",
        "modelo": "Bronco Sport",
        "anio": 2025,
        "version": "Outer Banks",
        "precio": Decimal("879900.00"),
        "color": "Gris Carbonizado",
        "descripcion": (
            "Motor EcoBoost 2.0L, 250 hp, tracción total AWD avanzada, "
            "panel solar en techo, asientos calefaccionados y SYNC 4."
        ),
        "wikipedia": "Ford_Bronco_Sport",
    },
    # -- AVENTURA ------------------------------------------------------------
    {
        "categoria": "Aventura",
        "modelo": "Bronco",
        "anio": 2025,
        "version": "Black Diamond 4×4",
        "precio": Decimal("1099900.00"),
        "color": "Azul Stellar",
        "descripcion": (
            "El Bronco original regresa. Motor EcoBoost 2.3L, 300 hp, "
            "tracción 4×4 con reducidas, diferencial trasero de bloqueo, "
            "barras protectoras de acero y puertas desmontables."
        ),
        "wikipedia": "Ford_Bronco_(sixth_generation)",
    },
    {
        "categoria": "Aventura",
        "modelo": "Bronco",
        "anio": 2025,
        "version": "Raptor",
        "precio": Decimal("1499900.00"),
        "color": "Blanco Código",
        "descripcion": (
            "El Bronco más extremo: motor EcoBoost 3.0L biturbo, 418 hp, "
            "suspensión Fox 3.1 de largo recorrido, llantas BFGoodrich de 37 pulgadas."
        ),
        "wikipedia": "Ford_Bronco_(sixth_generation)",
    },
    # -- DEPORTIVOS ----------------------------------------------------------
    {
        "categoria": "Deportivo",
        "modelo": "Mustang",
        "anio": 2025,
        "version": "EcoBoost Premium",
        "precio": Decimal("779900.00"),
        "color": "Rojo Carrera",
        "descripcion": (
            "Mustang Séptima Generación con motor EcoBoost 2.3L, 330 hp. "
            "Frenos Brembo, suspensión MagneRide opcional, pantalla SYNC 4 de 13.2\" "
            "y modos de conducción Normal, Sport, Track y Drag."
        ),
        "wikipedia": "Ford_Mustang_(seventh_generation)",
    },
    {
        "categoria": "Deportivo",
        "modelo": "Mustang",
        "anio": 2025,
        "version": "GT Premium",
        "precio": Decimal("989900.00"),
        "color": "Azul Grabber",
        "descripcion": (
            "El V8 que no muere: 5.0L Coyote con 480 hp y 569 Nm. "
            "Escape activo Ford Performance, diferencial Torsen de deslizamiento "
            "limitado y Launch Control."
        ),
        "wikipedia": "Ford_Mustang_(seventh_generation)",
    },
    {
        "categoria": "Deportivo",
        "modelo": "Mustang",
        "anio": 2025,
        "version": "Dark Horse",
        "precio": Decimal("1259900.00"),
        "color": "Negro Agate",
        "descripcion": (
            "El Mustang de pista más afilado: V8 5.0L de competición, 500 hp, "
            "frenos Brembo de 6 pistones, suspensión ajustable MagneRide "
            "y llantas Pirelli P Zero GT de 19\"."
        ),
        "wikipedia": "Ford_Mustang_(seventh_generation)",
    },
    # -- ELÉCTRICO -----------------------------------------------------------
    {
        "categoria": "Eléctrico",
        "modelo": "Mustang Mach-E",
        "anio": 2025,
        "version": "Select AWD",
        "precio": Decimal("899900.00"),
        "color": "Blanco Estelar",
        "descripcion": (
            "El SUV eléctrico con alma de Mustang. "
            "Doble motor, 346 hp, autonomía hasta 490 km (ciclo EPA). "
            "Carga rápida DC hasta 150 kW: 10→80 % en ~38 minutos."
        ),
        "wikipedia": "Ford_Mustang_Mach-E",
    },
    {
        "categoria": "Eléctrico",
        "modelo": "Mustang Mach-E",
        "anio": 2025,
        "version": "GT AWD",
        "precio": Decimal("1149900.00"),
        "color": "Verde Grabber",
        "descripcion": (
            "GT con 480 hp y 860 Nm de torque instantáneo. "
            "0–100 km/h en 3.7 s. MagneRide, modo GT personalizable y "
            "pantalla vertical de 15.5\"."
        ),
        "wikipedia": "Ford_Mustang_Mach-E",
    },
    {
        "categoria": "Eléctrico",
        "modelo": "F-150 Lightning",
        "anio": 2025,
        "version": "XLT Extended Range",
        "precio": Decimal("1299900.00"),
        "color": "Azul Antimatter",
        "descripcion": (
            "La pickup eléctrica más poderosa: 452 hp, autonomía 515 km. "
            "Pro Power Onboard de 9.6 kW (puede alimentar una casa). "
            "Frunk de 400 L, carga bidireccional Ford Intelligent Backup Power."
        ),
        "wikipedia": "Ford_F-150_Lightning",
    },
]


# ---------------------------------------------------------------------------
# Helpers de red
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

CONTENT_TYPES_VALIDOS = {"image/jpeg", "image/png", "image/webp", "image/gif"}

_wiki_cache: dict[str, str | None] = {}


def _url_imagen_wikipedia(articulo: str) -> str | None:
    """
    Obtiene la URL de la imagen principal del artículo de Wikipedia.
    Intenta primero con la API pageimages; si no hay resultado,
    usa la REST summary API como respaldo.
    Usa caché en memoria para no repetir consultas duplicadas.
    """
    if articulo in _wiki_cache:
        return _wiki_cache[articulo]

    ctx = ssl.create_default_context()

    # --- Intento 1: pageimages API ---
    api = (
        "https://en.wikipedia.org/w/api.php"
        "?action=query"
        "&prop=pageimages"
        "&pithumbsize=1200"
        f"&titles={urllib.parse.quote(articulo)}"
        "&format=json"
        "&origin=*"
    )
    try:
        req = urllib.request.Request(api, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            for page in pages.values():
                source = page.get("thumbnail", {}).get("source")
                if source:
                    _wiki_cache[articulo] = source
                    return source
    except Exception:
        pass

    # --- Intento 2: REST summary API ---
    rest_url = (
        "https://en.wikipedia.org/api/rest_v1/page/summary/"
        + urllib.parse.quote(articulo)
    )
    try:
        req = urllib.request.Request(rest_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            data = json.loads(resp.read())
            source = data.get("thumbnail", {}).get("source")
            _wiki_cache[articulo] = source
            return source
    except Exception:
        pass

    _wiki_cache[articulo] = None
    return None


def _descargar_imagen(url: str) -> tuple[str, str] | tuple[None, str]:
    """
    Descarga la imagen de *url* a un archivo temporal.
    Valida que el Content-Type sea realmente una imagen.
    Devuelve (ruta_temporal, nombre_archivo) si OK, o (None, mensaje_error).
    """
    ctx = ssl.create_default_context()
    for intento in range(3):
        try:
            if intento > 0:
                time.sleep(2 * intento)  # backoff: 2s, 4s
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=25, context=ctx) as resp:
                ct = resp.headers.get("Content-Type", "").split(";")[0].strip().lower()
                if ct not in CONTENT_TYPES_VALIDOS:
                    return None, f"content-type inválido: {ct}"
                ext = _extension_desde_url(url)
                nombre = urllib.parse.urlparse(url).path.split("/")[-1] or f"img.{ext}"
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
                    tmp.write(resp.read())
                    return tmp.name, nombre
        except Exception as exc:
            ultimo_error = str(exc)
            continue
    return None, ultimo_error


def _extension_desde_url(url: str) -> str:
    parte = url.split("?")[0].rsplit(".", 1)
    ext = parte[-1].lower() if len(parte) == 2 else "jpg"
    return ext if ext in ("jpg", "jpeg", "png", "webp") else "jpg"


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = "Pobla la BD con los vehículos del catálogo Ford México 2025."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sin-imagenes",
            action="store_true",
            default=False,
            help="Crea los vehículos sin descargar imágenes.",
        )
        parser.add_argument(
            "--limpiar",
            action="store_true",
            default=False,
            help="Elimina vehículos y categorías existentes antes de sembrar.",
        )

    def handle(self, *args, **options):
        sin_imagenes = options["sin_imagenes"]
        limpiar = options["limpiar"]

        if limpiar:
            self.stdout.write(self.style.WARNING("Eliminando datos existentes…"))
            # Borrar archivos físicos de imágenes antes de eliminar los registros
            for img in ImagenVehiculo.objects.all():
                try:
                    img.imagen.delete(save=False)
                except Exception:
                    pass
            ImagenVehiculo.objects.all().delete()
            Vehiculo.objects.all().delete()
            CategoriaVehiculo.objects.all().delete()

        # 1) Categorías
        self.stdout.write("Creando categorías…")
        cat_map: dict[str, CategoriaVehiculo] = {}
        for cat_data in CATEGORIAS:
            obj, created = CategoriaVehiculo.objects.get_or_create(
                nombre=cat_data["nombre"],
                defaults={"descripcion": cat_data["descripcion"]},
            )
            cat_map[obj.nombre] = obj
            estado = "[+] creada" if created else "[=] ya existe"
            self.stdout.write(f"  {estado}: {obj.nombre}")

        # 2) Vehículos
        self.stdout.write("\nCargando vehículos…")
        creados = 0
        actualizados = 0

        for datos in VEHICULOS:
            wikipedia = datos.get("wikipedia")
            cat_nombre = datos["categoria"]
            categoria = cat_map[cat_nombre]

            vehiculo, created = Vehiculo.objects.update_or_create(
                marca="Ford",
                modelo=datos["modelo"],
                anio=datos["anio"],
                version=datos["version"],
                defaults={
                    "categoria": categoria,
                    "precio": datos["precio"],
                    "color": datos.get("color", ""),
                    "descripcion": datos.get("descripcion", ""),
                    "estado": Vehiculo.Estado.DISPONIBLE,
                    "kilometraje": 0,
                },
            )

            if created:
                creados += 1
                self.stdout.write(
                    f"  [+] {vehiculo.marca} {vehiculo.modelo} "
                    f"{vehiculo.anio} {vehiculo.version}"
                )
            else:
                actualizados += 1
                self.stdout.write(
                    f"  [~] {vehiculo.marca} {vehiculo.modelo} "
                    f"{vehiculo.anio} {vehiculo.version} (actualizado)"
                )

            # Imagen principal — solo si el vehículo aún no tiene fotos
            if not sin_imagenes and wikipedia and not vehiculo.imagenes.exists():
                self._agregar_imagen(vehiculo, wikipedia)

        self.stdout.write(
            self.style.SUCCESS(
                f"\nListo. {creados} creados, {actualizados} actualizados."
            )
        )

    # ------------------------------------------------------------------
    def _agregar_imagen(self, vehiculo: Vehiculo, wikipedia: str) -> None:
        self.stdout.write(f"    [wiki] consultando '{wikipedia}'...", ending=" ")
        url = _url_imagen_wikipedia(wikipedia)
        if not url:
            self.stdout.write(self.style.WARNING("sin imagen en Wikipedia"))
            return

        self.stdout.write("descargando...", ending=" ")
        time.sleep(1)  # evitar rate-limit de Wikimedia
        ruta_tmp, nombre_o_error = _descargar_imagen(url)
        if ruta_tmp is None:
            self.stdout.write(self.style.WARNING(f"FALLÓ: {nombre_o_error}"))
            return

        ruta_tmp, nombre = ruta_tmp, nombre_o_error
        try:
            with open(ruta_tmp, "rb") as f:
                imagen_vehiculo = ImagenVehiculo(
                    vehiculo=vehiculo,
                    es_principal=True,
                    orden=0,
                )
                imagen_vehiculo.imagen.save(nombre, File(f), save=True)
            self.stdout.write(self.style.SUCCESS("OK"))
        except Exception as exc:
            self.stdout.write(self.style.WARNING(f"error al guardar: {exc}"))
        finally:
            try:
                os.unlink(ruta_tmp)
            except OSError:
                pass
