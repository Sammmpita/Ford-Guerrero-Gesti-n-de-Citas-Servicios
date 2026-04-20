import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarCheck, UserCheck, MapPin } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import StatusBadge from '../../components/admin/StatusBadge'
import DatePicker from '../../components/DatePicker'
import { useAuth } from '../../context/AuthContext'

// ── Datos estáticos ───────────────────────────────────────────────────────────

const PASOS = [
  {
    numero: '01',
    titulo: 'Explora el catálogo',
    descripcion: 'Navega por nuestros modelos y encuentra el Ford que mejor se adapta a tu estilo y presupuesto.',
    Icon: BookOpen,
    color: 'from-blue-50 to-white',
  },
  {
    numero: '02',
    titulo: 'Elige fecha y horario',
    descripcion: 'Selecciona el día y la hora que mejor te convenga. Consultamos disponibilidad en tiempo real.',
    Icon: CalendarCheck,
    color: 'from-blue-50 to-white',
  },
  {
    numero: '03',
    titulo: 'Asignación automática',
    descripcion: 'El sistema te asigna al asesor ideal según disponibilidad y especialidad en el vehículo de tu interés.',
    Icon: UserCheck,
    color: 'from-blue-50 to-white',
  },
  {
    numero: '04',
    titulo: 'Asiste a tu cita',
    descripcion: 'Visita la agencia y vive la experiencia Ford. Tu asesor ya conoce tus intereses y te estará esperando.',
    Icon: MapPin,
    color: 'from-blue-50 to-white',
  },
]

const BENEFICIOS = [
  {
    titulo: 'Sin costo',
    descripcion: 'Agendar una cita es completamente gratuito y sin ningún compromiso de compra.',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    titulo: 'Asesor personalizado',
    descripcion: 'Se te asigna el especialista ideal según el tipo de vehículo de tu interés.',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    titulo: 'Horarios flexibles',
    descripcion: 'Atención de lunes a sábado con múltiples franjas horarias. Tú eliges cuándo.',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-blue-600" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
]

const TIPOS_CITA = [
  {
    slug: 'test-drive',
    titulo: 'Prueba de manejo',
    descripcion:
      'Conduce el modelo que te interesa antes de tomar la decisión. Rutas diseñadas para que sientas el vehículo en diferentes condiciones.',
    duracion: '60 min aprox.',
    detalle: 'La opción más popular — maneja, pregunta y decide.',
  },
  {
    slug: 'consulta',
    titulo: 'Consulta / Visita',
    descripcion:
      'Habla con un asesor sobre versiones, colores, financiamiento y plazos, o simplemente visita la agencia para conocer el inventario. Sin presión, con información completa.',
    duracion: '45 min aprox.',
    detalle: 'Ideal para resolver dudas o conocer la agencia sin compromiso.',
  },
]

const FAQS = [
  {
    pregunta: '¿Necesito crear una cuenta para agendar?',
    respuesta:
      'Sí. El registro es gratuito y solo toma un minuto. Con tu cuenta puedes ver el historial de tus citas, cancelarlas y recibir actualizaciones de estado.',
  },
  {
    pregunta: '¿Puedo cancelar mi cita?',
    respuesta:
      'Sí, puedes cancelar citas en estado pendiente o confirmada directamente desde tu panel en "Mis Citas". Una vez completada o marcada como no asistida, la cita no puede cancelarse.',
  },
  {
    pregunta: '¿Cuánto dura la cita?',
    respuesta:
      'La duración estimada es de 60 minutos. Puedes encontrar el tiempo aproximado en la confirmación de tu cita según el tipo de visita.',
  },
  {
    pregunta: '¿Necesito elegir un vehículo al agendar?',
    respuesta:
      'Sí, debes seleccionar un vehículo de interés. Si solo quieres conocer la agencia sin un modelo en mente, elige la opción "Solo visita" en el selector de vehículos.',
  },
  {
    pregunta: '¿Cómo sé si mi cita fue confirmada?',
    respuesta:
      'Puedes consultar el estado de tu cita en cualquier momento desde tu panel en "Mis Citas". El estado cambiará de Pendiente a Confirmada cuando el asesor la acepte.',
  },
  {
    pregunta: '¿Quién me atiende?',
    respuesta:
      'El sistema asigna automáticamente al asesor disponible con menor carga de trabajo en el horario que elegiste. No puedes elegir asesor manualmente, pero garantizamos que siempre tendrás un especialista disponible.',
  },
]

// ── Utilidades ────────────────────────────────────────────────────────────────

const formatFecha = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const panelPorRol = (rol) => {
  if (rol === 'admin') return '/admin/citas'
  if (rol === 'vendedor') return '/vendedor/citas'
  return '/cliente/citas'
}

const formatHora = (h) => {
  const [hh, mm] = h.split(':').map(Number)
  const suffix = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 || 12
  return `${h12}:${String(mm).padStart(2, '0')} ${suffix}`
}

const today = new Date().toISOString().split('T')[0]

// ── Subcomponentes ────────────────────────────────────────────────────────────

const FaqItem = ({ pregunta, respuesta }) => {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        aria-expanded={abierto}
      >
        <span className="font-medium text-gray-900 text-sm pr-8 group-hover:text-zinc-700 transition-colors">
          {pregunta}
        </span>
        <span
          className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 ${abierto ? 'rotate-45' : ''}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      {abierto && (
        <p className="pb-6 text-sm font-light text-gray-500 leading-relaxed pr-8">
          {respuesta}
        </p>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const Citas = () => {
  const { user, getToken } = useAuth()
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // ── Mis próximas citas (autenticado) ──────────────────────────────────────
  const [proximasCitas, setProximasCitas] = useState([])
  const [loadingCitas, setLoadingCitas] = useState(false)

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [selectedCarId, setSelectedCarId] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [date, setDate] = useState('')
  const [availableHours, setAvailableHours] = useState([])
  const [loadingHours, setLoadingHours] = useState(false)
  const [selectedHour, setSelectedHour] = useState('')
  const [motivo, setMotivo] = useState('')
  const [tipoCita, setTipoCita] = useState('consulta')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)
  const [citaCreada, setCitaCreada] = useState(null)

  // Fetch vehículos (público, no requiere auth)
  useEffect(() => {
    fetch('/api/autos/vehiculos/')
      .then((r) => r.json())
      .then((data) => setVehicles(Array.isArray(data) ? data : data.results || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false))
  }, [])

  // Preseleccionar vehículo desde query params (ej: /citas?vehiculo=5#agendar)
  useEffect(() => {
    if (loadingVehicles || vehicles.length === 0) return
    const params = new URLSearchParams(location.search)
    const vehiculoId = params.get('vehiculo')
    if (vehiculoId) {
      const id = Number(vehiculoId)
      if (vehicles.some((v) => v.id === id)) {
        setSelectedCarId(id)
      }
      // Scroll al formulario
      setTimeout(() => {
        const el = document.getElementById('agendar')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }, [loadingVehicles, vehicles, location.search])

  // Fetch horas disponibles al cambiar fecha
  useEffect(() => {
    if (!date) { setAvailableHours([]); setSelectedHour(''); return }
    setLoadingHours(true)
    setSelectedHour('')
    fetch(`/api/vendedores/horas-disponibles/?fecha=${date}`)
      .then((r) => r.json())
      .then((data) => setAvailableHours(data.horas || []))
      .catch(() => setAvailableHours([]))
      .finally(() => setLoadingHours(false))
  }, [date])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch mis próximas citas (solo si autenticado)
  useEffect(() => {
    if (!user) return
    setLoadingCitas(true)
    fetch('/api/citas/', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.json())
      .then((data) => {
        const ahora = new Date()
        setProximasCitas(
          data
            .filter(
              (c) =>
                ['pendiente', 'confirmada'].includes(c.estado) &&
                new Date(c.fecha_hora) > ahora,
            )
            .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
            .slice(0, 3),
        )
      })
      .catch(() => {})
      .finally(() => setLoadingCitas(false))
  }, [user, getToken])

  const carDisplayName = (v) =>
    `${v.marca} ${v.modelo} ${v.anio}${v.version ? ` — ${v.version}` : ''}`

  const selectedCar = vehicles.find((v) => v.id === selectedCarId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!selectedCarId) {
      setFormError('Selecciona un vehículo de interés o elige "Solo visita".')
      return
    }
    if (!date || !selectedHour) {
      setFormError('Selecciona una fecha y un horario.')
      return
    }
    const fechaHora = `${date}T${selectedHour}:00`
    const esSoloVisita = selectedCarId === 'solo-visita'
    const motivoFinal = esSoloVisita
      ? `[Solo visita] ${motivo || tipoCita}`.trim()
      : motivo || tipoCita
    setSubmitting(true)
    try {
      const res = await fetch('/api/citas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          vehiculo: esSoloVisita ? null : selectedCarId || null,
          fecha_hora: fechaHora,
          motivo: motivoFinal,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const firstKey = Object.keys(data)[0]
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        throw new Error(msg || 'Error al agendar la cita.')
      }
      setCitaCreada(data)
      setFormSuccess(true)
      setTimeout(() => {
        document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getNombreVehiculo = (cita) => {
    if (cita.vehiculo_nombre) return cita.vehiculo_nombre
    if (cita.vehiculo) {
      const v = cita.vehiculo
      return `${v.marca || ''} ${v.modelo || ''} ${v.anio || ''}`.trim()
    }
    return null
  }

  const getNombreVendedor = (cita) => {
    if (cita.vendedor_nombre) return cita.vendedor_nombre
    if (cita.vendedor?.usuario) {
      const u = cita.vendedor.usuario
      return `${u.first_name} ${u.last_name}`.trim() || u.email
    }
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] flex flex-col" style={{ minHeight: '62vh' }}>
        <div className="relative z-10 flex-1 flex items-center py-24">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-8">
                Agencia Ford — Acapulco
              </p>
              <h1 className="font-black leading-none tracking-tight">
                <span className="block text-5xl md:text-7xl text-white">
                  Agenda tu
                </span>
                <span className="block text-5xl md:text-7xl text-white">
                  cita Ford<span className="text-blue-500">.</span>
                </span>
              </h1>
              <p className="mt-8 font-light text-gray-400 max-w-md text-base leading-relaxed">
                Prueba de manejo o consulta con asesor — en minutos
                te asignamos al especialista ideal según tu horario y preferencias.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#agendar"
                  className="px-8 py-3.5 bg-blue-700 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-blue-600 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-950"
                >
                  Agendar ahora
                </a>
                <Link
                  to="/catalogo"
                  className="px-8 py-3.5 border border-gray-500 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-white rounded-none focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
                >
                  Ver catálogo
                </Link>
                <Link
                  to="/servicio/agendar"
                  className="px-8 py-3.5 border border-gray-500 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-white rounded-none focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-950"
                >
                  Agendar servicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. MIS PRÓXIMAS CITAS (solo autenticados) ────────────────────────── */}
      {user && (
        <section className="bg-gray-50 border-b border-gray-200 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-1">
                  Tu agenda
                </p>
                <h2 className="font-black text-2xl text-gray-900 tracking-tight leading-none">
                  Mis próximas citas
                </h2>
              </div>
              <Link
                to={panelPorRol(user.rol)}
                className="text-sm uppercase tracking-widest text-gray-500 border-b border-gray-300 pb-0.5 hover:text-zinc-900 hover:border-zinc-900 transition-colors duration-200"
              >
                Ver todas →
              </Link>
            </div>

            {loadingCitas ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="border border-gray-200 bg-white p-6 animate-pulse">
                    <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
                    <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : proximasCitas.length === 0 ? (
              <div className="border border-dashed border-gray-300 bg-white py-12 px-8 text-center">
                <p className="text-gray-400 text-sm font-light mb-4">
                  No tienes citas próximas programadas.
                </p>
                <a
                  href="#agendar"
                  className="inline-block px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none"
                >
                  Agendar mi primera cita
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proximasCitas.map((cita) => {
                  const vehiculo = getNombreVehiculo(cita)
                  const vendedor = getNombreVendedor(cita)
                  return (
                    <div
                      key={cita.id}
                      className="border border-gray-200 bg-white p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                          Cita #{cita.id}
                        </span>
                        <StatusBadge value={cita.estado} type="status" />
                      </div>
                      <p className="font-medium text-gray-900 text-sm mb-1">
                        {formatFecha(cita.fecha_hora)}
                      </p>
                      {vehiculo && (
                        <p className="text-xs text-gray-500 font-light mb-1">
                          Vehículo: {vehiculo}
                        </p>
                      )}
                      {vendedor && (
                        <p className="text-xs text-gray-400 font-light">
                          Asesor: {vendedor}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. CÓMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section className="bg-[#f8fafc] py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-4">
            <div>
              <p className="uppercase text-xs tracking-widest text-[#003478] font-semibold mb-3">
                Proceso
              </p>
              <h2 className="font-black text-4xl md:text-5xl text-gray-900 tracking-tight leading-none">
                Cómo funciona.
              </h2>
            </div>
            <p className="text-sm text-gray-400 font-light max-w-xs leading-relaxed text-right hidden md:block">
              Desde tu dispositivo hasta la agencia,<br/>en cuatro pasos simples.
            </p>
          </div>

          {/* Timeline grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">

            {/* Línea conectora — solo desktop */}
            <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-[#003478]/20 to-transparent z-0" />

            {PASOS.map(({ numero, titulo, descripcion, Icon }, idx) => (
              <div
                key={numero}
                className="relative flex flex-col items-center text-center px-6 pb-10 pt-2 group"
              >
                {/* Círculo con icono */}
                <div className="relative z-10 mb-6">
                  <div className="w-[72px] h-[72px] rounded-full bg-white border-2 border-[#003478]/10 flex items-center justify-center shadow-md shadow-blue-900/5 group-hover:border-[#003478]/40 group-hover:shadow-lg group-hover:shadow-blue-900/10 transition-all duration-300">
                    <Icon
                      size={28}
                      strokeWidth={1.6}
                      className="text-[#003478] group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Dot de paso */}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#003478] flex items-center justify-center">
                    <span className="text-white font-bold" style={{ fontSize: '9px' }}>{idx + 1}</span>
                  </span>
                </div>

                {/* Texto */}
                <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-3">
                    {titulo}
                  </h3>
                  <p className="font-light text-gray-500 text-sm leading-relaxed">
                    {descripcion}
                  </p>
                </div>

                {/* Flecha entre pasos — mobile */}
                {idx < PASOS.length - 1 && (
                  <div className="md:hidden mt-6 text-[#003478]/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA centrado */}
          <div className="mt-10 flex justify-center">
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#003478] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#002560] transition-colors duration-200 rounded-full shadow-md shadow-blue-900/20"
            >
              Agendar ahora
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. BENEFICIOS ────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
            Ventajas
          </p>
          <h2 className="font-black text-4xl text-gray-900 tracking-tight leading-none mb-14">
            Por qué agendar con nosotros.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFICIOS.map(({ titulo, descripcion, icono }) => (
              <div
                key={titulo}
                className="bg-white border border-gray-200 p-8 hover:border-gray-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] transition-all duration-300"
              >
                <div className="mb-5">{icono}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{titulo}</h3>
                <p className="font-light text-gray-500 text-sm leading-relaxed">{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TIPOS DE CITA ─────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
            Modalidades
          </p>
          <h2 className="font-black text-4xl text-gray-900 tracking-tight leading-none mb-14">
            Elige tu tipo de visita.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
            {TIPOS_CITA.map(({ slug, titulo, descripcion, duracion, detalle }, idx) => (
              <div
                key={slug}
                className={`p-10 ${idx < TIPOS_CITA.length - 1 ? 'border-b md:border-b-0 md:border-r border-gray-200' : ''}`}
              >
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-medium mb-4">
                  {duracion}
                </p>
                <h3 className="font-black text-xl text-gray-900 mb-4 leading-tight">
                  {titulo}
                </h3>
                <p className="font-light text-gray-500 text-sm leading-relaxed mb-6">
                  {descripcion}
                </p>
                <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-4">
                  {detalle}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a
              href="#agendar"
              className="inline-block px-10 py-3.5 bg-zinc-900 text-white text-sm font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none"
            >
              Agendar ahora — es gratis
            </a>
          </div>
        </div>
      </section>


      {/* ── 6. FORMULARIO DE AGENDAMIENTO ────────────────────────────────────── */}
      <section id="agendar" className="bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6">

          {formSuccess ? (
            /* Estado de éxito */
            <div className="max-w-2xl mx-auto">
              {/* Encabezado */}
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-white mx-auto mb-8 flex items-center justify-center">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-zinc-900">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-4">Cita registrada</p>
                <h2 className="font-black text-4xl text-white tracking-tight leading-none mb-4">
                  ¡Tu cita ha sido agendada!
                </h2>
                <p className="text-gray-400 font-light leading-relaxed">
                  Un asesor ha sido asignado automáticamente a tu visita.
                </p>
              </div>

              {/* Tarjeta de resumen */}
              {citaCreada && (
                <div className="bg-white/10 border border-white/20 rounded-none mb-10">
                  <div className="border-b border-white/10 px-6 py-4">
                    <p className="text-xs uppercase tracking-widest text-blue-300 font-medium">Resumen de tu cita</p>
                  </div>
                  <div className="divide-y divide-white/10">
                    {/* Fecha y hora */}
                    <div className="flex items-start justify-between px-6 py-4 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Fecha y hora</span>
                      <span className="text-white text-sm font-medium text-right">
                        {new Date(citaCreada.fecha_hora).toLocaleString('es-MX', {
                          weekday: 'long', year: 'numeric', month: 'long',
                          day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {/* Duración */}
                    <div className="flex items-start justify-between px-6 py-4 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Duración</span>
                      <span className="text-white text-sm font-medium">{citaCreada.duracion_minutos} minutos</span>
                    </div>
                    {/* Vehículo */}
                    <div className="flex items-start justify-between px-6 py-4 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Vehículo</span>
                      <span className="text-white text-sm font-medium text-right">
                        {citaCreada.vehiculo_nombre || 'Solo visita (sin vehículo específico)'}
                      </span>
                    </div>
                    {/* Asesor */}
                    <div className="flex items-start justify-between px-6 py-4 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Asesor asignado</span>
                      <span className="text-white text-sm font-medium text-right">
                        {citaCreada.vendedor_nombre || 'Por asignar'}
                      </span>
                    </div>
                    {/* Motivo */}
                    {citaCreada.motivo && (
                      <div className="flex items-start justify-between px-6 py-4 gap-4">
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Motivo</span>
                        <span className="text-white text-sm font-light text-right">{citaCreada.motivo}</span>
                      </div>
                    )}
                    {/* Estado */}
                    <div className="flex items-start justify-between px-6 py-4 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">Estado</span>
                      <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-yellow-400 text-yellow-900">
                        {citaCreada.estado}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="#agendar"
                  onClick={() => { setFormSuccess(false); setCitaCreada(null); setDate(''); setSelectedCarId(''); setSelectedHour(''); setMotivo(''); }}
                  className="px-8 py-3.5 border border-gray-600 text-white text-sm font-medium tracking-widest uppercase hover:border-gray-400 transition-colors rounded-none cursor-pointer"
                >
                  Agendar otra cita
                </a>
                <Link
                  to={panelPorRol(user?.rol || 'cliente')}
                  className="px-8 py-3.5 bg-white text-zinc-900 text-sm font-medium tracking-widest uppercase hover:bg-gray-100 transition-colors rounded-none"
                >
                  Ver mis citas
                </Link>
              </div>
            </div>

          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

              {/* Columna izquierda — título + info */}
              <div>
                <p className="text-blue-400 uppercase tracking-widest text-xs font-medium mb-6">
                  Agenda tu visita
                </p>
                <h2 className="font-black text-5xl text-white tracking-tight leading-none mb-6">
                  Tu próximo Ford<br />te está esperando.
                </h2>
                <p className="text-gray-400 font-light leading-relaxed max-w-sm mb-10">
                  Sin costo, sin compromiso. En minutos te asignamos al asesor disponible
                  según el horario que elijas.
                </p>
                {['Sin costo', 'Vendedor asignado automáticamente', 'Confirmación inmediata'].map((p) => (
                  <div key={p} className="border-t border-blue-900/60 py-4 flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-light">{p}</span>
                    <span className="text-blue-500 text-xs" aria-hidden="true">●</span>
                  </div>
                ))}
              </div>

              {/* Columna derecha — formulario */}
              <div className="bg-white p-10">

                {!user ? (
                  /* Sin sesión */
                  <div className="text-center py-8">
                    <p className="font-medium text-gray-900 text-lg mb-2">Inicia sesión para agendar</p>
                    <p className="text-sm text-gray-500 font-light mb-8">
                      Necesitas una cuenta para reservar tu cita. El registro es gratuito.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/login"
                        className="w-full py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none text-center"
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        to="/registro"
                        className="w-full py-3 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase hover:bg-zinc-900 hover:text-white transition-colors rounded-none text-center"
                      >
                        Crear cuenta gratis
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                    {/* Tipo de cita */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                        Tipo de visita
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[{ value: 'test-drive', label: 'Test Drive' }, { value: 'consulta', label: 'Consulta / Visita' }].map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setTipoCita(value)}
                            className={`py-2.5 text-xs font-medium tracking-widest uppercase border transition-all duration-200 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900
                              ${tipoCita === value ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vehículo de interés (obligatorio) */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                        Vehículo de interés *
                      </label>
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          disabled={loadingVehicles}
                          className="w-full flex items-center justify-between border-0 border-b border-gray-300 bg-transparent px-0 py-3 text-sm text-gray-700 focus:border-zinc-900 focus:outline-none transition-colors disabled:opacity-50"
                        >
                          <span className={selectedCarId ? 'text-gray-900' : 'text-gray-400 font-light'}>
                            {loadingVehicles ? 'Cargando modelos...' : selectedCarId === 'solo-visita' ? 'Solo visita (sin vehículo específico)' : selectedCar ? carDisplayName(selectedCar) : 'Seleccionar modelo...'}
                          </span>
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-52 overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => { setSelectedCarId('solo-visita'); setIsDropdownOpen(false) }}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedCarId === 'solo-visita' ? 'font-bold text-zinc-900 bg-zinc-50' : 'text-gray-500 italic'}`}
                            >
                              Solo visita (sin vehículo específico)
                            </button>
                            {vehicles.map((car) => (
                              <button
                                key={car.id}
                                type="button"
                                onClick={() => { setSelectedCarId(car.id); setIsDropdownOpen(false) }}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors ${selectedCarId === car.id ? 'font-bold text-zinc-900 bg-zinc-50' : 'font-medium text-gray-700'}`}
                              >
                                {carDisplayName(car)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fecha */}
                    <div>
                      <label htmlFor="fecha" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                        Fecha *
                      </label>
                      <DatePicker
                        id="fecha"
                        value={date}
                        onChange={setDate}
                        min={today}
                        required
                      />
                    </div>

                    {/* Hora */}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                        Horario disponible *
                      </label>
                      {!date && (
                        <p className="text-sm text-gray-400 font-light">Selecciona primero una fecha.</p>
                      )}
                      {date && loadingHours && (
                        <div className="grid grid-cols-4 gap-2">
                          {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse" />)}
                        </div>
                      )}
                      {date && !loadingHours && availableHours.length === 0 && (
                        <p className="text-sm text-red-600 font-light">Sin disponibilidad para esta fecha.</p>
                      )}
                      {date && !loadingHours && availableHours.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {availableHours.map((hora) => (
                            <button
                              key={hora}
                              type="button"
                              onClick={() => setSelectedHour(hora)}
                              className={`py-2.5 text-xs font-medium tracking-wide uppercase border transition-all duration-200 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900
                                ${selectedHour === hora ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'}`}
                            >
                              {formatHora(hora)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Motivo */}
                    <div>
                      <label htmlFor="motivo" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                        Comentarios <span className="normal-case text-gray-400">(opcional)</span>
                      </label>
                      <input
                        id="motivo"
                        type="text"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Me interesa la versión Raptor en negro"
                        className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                      />
                    </div>

                    {/* Error */}
                    {formError && (
                      <p className="text-sm text-red-600 font-light">{formError}</p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-zinc-900 text-white text-sm font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
                    >
                      {submitting ? 'Agendando...' : 'Confirmar cita'}
                    </button>

                    <p className="text-xs text-gray-400 font-light text-center">
                      Agendando como <span className="font-medium text-gray-700">{user.first_name || user.email}</span>
                    </p>

                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
            Preguntas frecuentes
          </p>
          <h2 className="font-black text-4xl text-gray-900 tracking-tight leading-none mb-14">
            Todo lo que necesitas saber.
          </h2>
          <div>
            {FAQS.map((faq) => (
              <FaqItem key={faq.pregunta} pregunta={faq.pregunta} respuesta={faq.respuesta} />
            ))}
          </div>
          {!user && (
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500 font-light mb-4">
                ¿Listo para comenzar? Crea tu cuenta gratis en menos de un minuto.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/registro"
                  className="px-8 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none"
                >
                  Crear cuenta
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase hover:bg-zinc-900 hover:text-white transition-colors rounded-none"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. BANNER CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-blue-400 uppercase tracking-widest text-xs font-medium mb-4">
              Agenda sin compromiso
            </p>
            <h2 className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none">
              Tu próximo Ford<br />te está esperando.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <a
              href="#agendar"
              className="px-10 py-4 bg-blue-700 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-blue-600 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-950 text-center"
            >
              Agendar mi cita
            </a>
            <Link
              to="/catalogo"
              className="px-10 py-4 border border-gray-600 text-white text-sm font-medium tracking-widest uppercase hover:border-gray-400 transition-colors rounded-none text-center"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Citas
