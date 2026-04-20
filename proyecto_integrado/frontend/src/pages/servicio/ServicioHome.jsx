import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'

const SERVICIOS = [
  {
    slug: 'Preventivo',
    titulo: 'Mantenimiento Preventivo',
    descripcion: 'Revisión completa de fluidos, filtros, bujías y frenos para mantener tu Ford en óptimas condiciones.',
  },
  {
    slug: 'Frenos',
    titulo: 'Sistema de Frenos',
    descripcion: 'Diagnóstico y reparación de frenos delanteros y traseros. Pastillas, discos y sistema hidráulico.',
  },
  {
    slug: 'Suspension',
    titulo: 'Suspensión',
    descripcion: 'Revisión de amortiguadores, rótulas, terminales y geometría. Garantizamos comodidad y seguridad.',
  },
  {
    slug: 'Electrico',
    titulo: 'Sistema Eléctrico',
    descripcion: 'Diagnóstico computarizado, batería, alternador, arranque y módulos de control del vehículo.',
  },
  {
    slug: 'Otro',
    titulo: 'Otro Servicio',
    descripcion: 'Cualquier otra falla o revisión específica. Describe el problema y nuestros técnicos te ayudarán.',
  },
  {
    slug: null,
    titulo: 'Servicio Ford Certificado',
    descripcion: 'Todos nuestros trabajos son realizados por técnicos certificados Ford con refacciones originales y garantía de servicio.',
  },
]


export default function ServicioHome() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] flex flex-col"
        style={{ minHeight: '60vh' }}
      >
        <div className="relative z-10 flex-1 flex items-center py-24">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-8">
                Taller de Servicio — Ford Guerrero
              </p>
              <h1 className="font-black leading-none tracking-tight">
                <span className="block text-5xl md:text-7xl text-white">Cuida tu</span>
                <span className="block text-5xl md:text-7xl text-white">
                  Ford<span className="text-blue-500">.</span>
                </span>
              </h1>
              <p className="mt-8 font-light text-gray-400 max-w-md text-base leading-relaxed">
                Servicio técnico autorizado. Agenda tu cita en línea, sigue el avance en tiempo real
                y recibe tu vehículo en perfectas condiciones.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/servicio/agendar"
                  className="px-8 py-3.5 bg-blue-700 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-blue-600 rounded-none"
                >
                  Agendar cita
                </Link>
                {user && (
                  <Link
                    to="/cliente/mis-citas-servicio"
                    className="px-8 py-3.5 border border-gray-500 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-white rounded-none"
                  >
                    Mis citas de servicio
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ───────────────────────────────────────────────── */}
      <section className="bg-[#f8fafc] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-[#003478] font-semibold mb-3">
            Especialidades
          </p>
          <h2 className="font-black text-4xl md:text-5xl text-gray-900 tracking-tight leading-none mb-16">
            Qué atendemos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200">
            {SERVICIOS.map(({ slug, titulo, descripcion }, idx) => (
              <div
                key={slug || titulo}
                className={`p-8 bg-white hover:bg-gray-50 transition-colors duration-200 ${
                  idx % 3 !== 2 ? 'md:border-r border-gray-200' : ''
                } ${idx < 3 ? 'border-b border-gray-200' : ''}`}
              >
                <h3 className="font-bold text-gray-900 text-base mb-3 leading-tight">{titulo}</h3>
                <p className="font-light text-gray-500 text-sm leading-relaxed">{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-blue-400 uppercase tracking-widest text-xs font-medium mb-4">
              Servicio técnico Ford
            </p>
            <h2 className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none">
              Tu Ford merece<br />lo mejor.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link
              to="/servicio/agendar"
              className="px-10 py-4 bg-blue-700 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-blue-600 rounded-none text-center"
            >
              Agendar servicio
            </Link>
            {user && (
              <Link
                to="/cliente/mis-citas-servicio"
                className="px-10 py-4 border border-gray-600 text-white text-sm font-medium tracking-widest uppercase hover:border-gray-400 transition-colors rounded-none text-center"
              >
                Mis citas
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
