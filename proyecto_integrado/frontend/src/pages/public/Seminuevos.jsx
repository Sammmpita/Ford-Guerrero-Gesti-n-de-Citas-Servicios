import { Link } from 'react-router-dom'
import { MapPin, Phone, RotateCcw, CalendarCheck, ShieldCheck, BadgeCheck } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import FloatingTestDrive from '../../components/FloatingTestDrive'

const GARANTIAS = [
  {
    icon: ShieldCheck,
    titulo: 'Garantía Ford',
    desc: 'Cada seminuevo pasa por una revisión de más de 150 puntos antes de salir a la venta.',
  },
  {
    icon: BadgeCheck,
    titulo: 'Certificado de origen',
    desc: 'Historial de propietarios y kilometraje verificado. Sin sorpresas al momento de la compra.',
  },
  {
    icon: RotateCcw,
    titulo: 'Devolución garantizada',
    desc: 'Si en los primeros 7 días no estás satisfecho, gestionamos la devolución sin cargos ocultos.',
  },
  {
    icon: CalendarCheck,
    titulo: 'Financiamiento disponible',
    desc: 'Planes de financiamiento flexibles con tasas preferenciales para vehículos seminuevos Ford.',
  },
]

export default function Seminuevos() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FloatingTestDrive />

      {/* Topbar */}
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

      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-[#f8fafc] border-b border-gray-100 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
          <span className="absolute -right-7 top-1/2 -translate-y-1/2 font-black text-[180px] leading-none text-[#003478] tracking-tight select-none pointer-events-none" style={{ opacity: 0.04 }}>
            PROXIMAMENTE
          </span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <p className="uppercase text-xs tracking-widest text-[#003478] font-semibold mb-4">
            seminuevos
          </p>
          <h1 className="font-black text-5xl md:text-7xl text-gray-900 tracking-tight leading-none mb-6">
            Próximamente.
          </h1>
          <p className="text-gray-500 font-light text-lg max-w-xl leading-relaxed mb-10">
            Estamos preparando nuestro inventario de vehículos seminuevos certificados Ford.
            Mientras tanto, puedes visitarnos en agencia o agendar una cita para conocer
            las unidades disponibles.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/citas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#003478] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#002560] transition-colors duration-200 rounded-full shadow-md shadow-blue-900/20"
            >
              <CalendarCheck size={16} />
              Agendar visita
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest hover:border-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-full"
            >
              Consultar disponibilidad
            </Link>
          </div>
        </div>
      </section>

      {/* ── GARANTÍAS ── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-[#003478] font-semibold mb-3">
            Nuestro compromiso
          </p>
          <h2 className="font-black text-4xl text-gray-900 tracking-tight leading-none mb-14">
            Por qué elegir un<br />seminuevo Ford.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {GARANTIAS.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="group">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 transition-colors" style={{ backgroundColor: 'rgba(0,52,120,0.08)' }}>
                  <Icon size={22} strokeWidth={1.6} className="text-[#003478]" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{titulo}</h3>
                <p className="text-sm font-light text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER VENDE TU AUTO ── */}
      <section className="bg-[#003478] py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-blue-300 text-xs uppercase tracking-widest font-semibold mb-2">
              ¿Tienes un auto que ya no usas?
            </p>
            <h2 className="font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Cotiza tu vehículo<br />con nosotros.
            </h2>
          </div>
          <div className="flex-shrink-0">
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#003478] text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors duration-200 rounded-full shadow-lg"
            >
              Contactar asesor
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  )
}
