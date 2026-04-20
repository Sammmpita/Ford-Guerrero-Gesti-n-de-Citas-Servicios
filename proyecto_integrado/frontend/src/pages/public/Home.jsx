import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import VehiculoCard from '../../components/VehiculoCard'
import FloatingTestDrive from '../../components/FloatingTestDrive'
import HeroCarousel from '../../components/HeroCarousel'
import DatePicker from '../../components/DatePicker'
import useVehiculos from '../../hooks/useVehiculos'

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(precio)

const getImagen = (v) => {
  const imgs = v.imagenes || []
  return (imgs.find((i) => i.es_principal) || imgs[0])?.imagen || null
}

const CardSkeleton = () => (
  <div className="border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-video w-full bg-gray-100" />
    <div className="p-6 flex flex-col gap-3">
      <div className="h-3 w-16 bg-gray-100 rounded" />
      <div className="h-5 w-3/4 bg-gray-100 rounded" />
      <div className="h-3 w-1/2 bg-gray-100 rounded" />
      <div className="h-5 w-1/3 bg-gray-100 rounded" />
    </div>
  </div>
)



const ACCIONES = [
  {
    id: 'cotizar',
    titulo: 'Cotízalo',
    descripcion: 'Configura y recibe información del auto que deseas.',
    icon: <img src="/carrusel/cotizalo.png" alt="Cotízalo" className="w-20 h-20 object-contain" />,
  },
  {
    id: 'financiamiento',
    titulo: 'Financiamiento',
    descripcion: 'Encuentra un plan y opciones de compra a tu medida.',
    icon: <img src="/carrusel/financiamiento.png" alt="Financiamiento" className="w-20 h-20 object-contain" />,
  },
  {
    id: 'manejo',
    titulo: 'Manéjalo',
    descripcion: 'Reserva tu prueba de manejo ahora y enamórate de tu nuevo auto.',
    icon: <img src="/carrusel/manejalo.png" alt="Manéjalo" className="w-20 h-20 object-contain" />,
  },
]

const PUNTOS_VALOR = ['Sin costo', 'Vendedor asignado', 'Confirmación inmediata']

const FORM_INICIAL = {
  nombre:   '',
  email:    '',
  telefono: '',
  vehiculo: '',
  fecha:    '',
}

// ── Componente principal ──────────────────────────────────────────────────────

const Home = () => {
  const { vehiculos, loading } = useVehiculos({ limit: 3 })
  const [form, setForm] = useState(FORM_INICIAL)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: conectar con el endpoint POST /api/citas/
    console.log('Cita solicitada:', form)
  }

  return (
    <div className="min-h-screen bg-white">
      <FloatingTestDrive />

      {/* ── 1. TOPBAR ──────────────────────────────────────────────────────── */}
      <div className="h-10 bg-[#003478]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <p className="text-xs text-blue-100 font-light tracking-wide flex items-center gap-1.5">
            <MapPin size={13} className="opacity-70" />
            Acapulco, Gro. — Av. Farallón No. 18 esq. Rancho Acapulco
          </p>
          <a href="tel:7441234567" className="font-mono text-xs text-blue-100 tracking-wide flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={12} className="opacity-70" />
            744 123 4567
          </a>
        </div>
      </div>

      {/* ── 2. NAVBAR ──────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── 3. HERO ────────────────────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── 4. ACCIONES RÁPIDAS ────────────────────────────────────────────── */}
      <section className="bg-white py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">

          {/* Título de sección centrado */}
          <h2 className="text-center text-2xl md:text-3xl text-gray-900 mb-16">
            Es muy fácil estrenar un <span className="font-bold">Ford</span>
          </h2>

          {/* Grid de tarjetas centradas con iconos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {ACCIONES.map(({ id, titulo, descripcion, icon }) => (
              <div
                key={id}
                className="group flex flex-col items-center text-center px-6 py-8
                           transition-all duration-300 ease-out cursor-pointer
                           hover:-translate-y-1"
              >
                {/* Icono SVG con hover scale */}
                <div className="mb-6 transition-transform duration-300 ease-out group-hover:scale-110">
                  {icon}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {titulo}
                </h3>
                <p className="font-light text-gray-500 text-sm leading-relaxed max-w-xs">
                  {descripcion}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 5. CATÁLOGO PREVIEW ────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header de sección: eyebrow + título + botón Ver todos */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
                Catálogo
              </p>
              <h2 className="font-black text-4xl text-gray-900 tracking-tight leading-none">
                Modelos disponibles.
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="hidden md:inline-block text-sm uppercase tracking-widest text-gray-500
                         border-b border-gray-300 pb-0.5
                         hover:text-zinc-900 hover:border-zinc-900 transition-colors duration-200"
            >
              Ver todos →
            </Link>
          </div>

          {/* Grid de VehiculoCard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
              : vehiculos.map((v) => (
                  <VehiculoCard
                    key={v.id}
                    modelo={v.modelo}
                    categoria={v.categoria?.nombre?.toUpperCase() || ''}
                    precio={formatPrecio(v.precio)}
                    imagen={getImagen(v)}
                    version={v.version}
                    anio={v.anio}
                  />
                ))
            }
          </div>

          {/* Ver todos — solo en mobile */}
          <div className="mt-8 md:hidden text-center">
            <Link
              to="/catalogo"
              className="text-sm uppercase tracking-widest text-gray-500 hover:text-zinc-900 transition-colors"
            >
              Ver todos los modelos →
            </Link>
          </div>

        </div>
      </section>

      {/* ── 6. FORMULARIO DE CITA ──────────────────────────────────────────── */}
      <section className="bg-zinc-900 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            {/* Columna izquierda: texto editorial */}
            <div>
              <p className="text-blue-400 uppercase tracking-widest text-xs font-medium mb-6">
                Agenda tu visita
              </p>
              <h2 className="font-black text-5xl text-white tracking-tight leading-none mb-6">
                Tu próximo Ford<br />te está esperando.
              </h2>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                Agenda una cita con nuestro equipo de ventas. Sin presión, sin compromiso —
                solo la mejor experiencia de compra en Acapulco.
              </p>

              {/* Puntos de valor con divisorias */}
              <div className="mt-10">
                {PUNTOS_VALOR.map((punto) => (
                  <div
                    key={punto}
                    className="border-t border-zinc-800 py-4 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-300 font-light">{punto}</span>
                    <span className="text-blue-500 text-xs" aria-hidden="true">●</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha: formulario sobre fondo blanco */}
            <div className="bg-white p-10">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                {/* Nombre completo */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Juan García"
                    autoComplete="name"
                    required
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>

                {/* Correo electrónico */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@correo.com"
                    autoComplete="email"
                    required
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="744 000 0000"
                    autoComplete="tel"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900 font-mono
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>

                {/* Vehículo de interés */}
                <div>
                  <label
                    htmlFor="vehiculo"
                    className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
                  >
                    Vehículo de interés
                  </label>
                  <select
                    id="vehiculo"
                    name="vehiculo"
                    value={form.vehiculo}
                    onChange={handleChange}
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900 appearance-none"
                  >
                    <option value="">Seleccionar modelo...</option>
                    {vehiculos.map((v) => (
                      <option key={v.id} value={v.modelo}>
                        {v.modelo} {v.version} {v.anio}
                      </option>
                    ))}
                    <option value="otro">Otro / No sé aún</option>
                  </select>
                </div>

                {/* Fecha preferida */}
                <div>
                  <label
                    htmlFor="fecha"
                    className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
                  >
                    Fecha preferida
                  </label>
                  <DatePicker
                    id="fecha"
                    value={form.fecha}
                    onChange={(val) => setForm({ ...form, fecha: val })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Botón submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-zinc-900 text-white text-sm font-medium
                               tracking-widest uppercase transition-all duration-300 ease-out
                               hover:-translate-y-px hover:bg-zinc-800 rounded-none
                               focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
                  >
                    Solicitar cita
                  </button>
                  <p className="mt-3 text-xs text-gray-400 text-center">
                    Al enviar aceptas nuestro{' '}
                    <a
                      href="#"
                      className="underline hover:text-gray-600 transition-colors"
                    >
                      aviso de privacidad
                    </a>
                  </p>
                </div>

              </form>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. BANNER FINANCIAMIENTO ───────────────────────────────────────── */}
      <section className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Texto editorial */}
            <div>
              <p className="uppercase text-xs tracking-widest text-blue-200 font-medium mb-3">
                Financiamiento Ford
              </p>
              <h3 className="font-black text-3xl md:text-4xl text-white tracking-tight leading-none">
                Tu Ford, a tu medida.
              </h3>
              <p className="mt-3 text-blue-200 font-light max-w-lg text-sm leading-relaxed">
                Tasas preferenciales, plazos flexibles y aprobación rápida.
                Simulador de crédito disponible en agencia sin costo.
              </p>
            </div>

            {/* Botón ghost sobre azul */}
            <div className="flex-shrink-0">
              <button className="px-8 py-3.5 border border-white text-white text-sm font-medium
                                 tracking-widest uppercase transition-all duration-300 ease-out
                                 hover:bg-white hover:text-blue-700 rounded-none
                                 focus:outline-none focus:ring-1 focus:ring-white
                                 focus:ring-offset-2 focus:ring-offset-blue-700">
                Conocer opciones
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── 8. FOOTER ──────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  )
}

export default Home
