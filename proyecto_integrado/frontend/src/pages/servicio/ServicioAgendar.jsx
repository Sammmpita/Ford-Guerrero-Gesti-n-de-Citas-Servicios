import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'

const SERVICIOS = [
  { value: 'Preventivo', label: 'Mantenimiento Preventivo' },
  { value: 'Frenos', label: 'Sistema de Frenos' },
  { value: 'Suspension', label: 'Suspensión' },
  { value: 'Electrico', label: 'Sistema Eléctrico' },
  { value: 'Otro', label: 'Otro (Especificar)' },
]

const HORAS_COMPLETO  = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']
const HORAS_REDUCIDO  = ['09:00','10:00','11:00','12:00','13:00']

const formatHora = (h) => {
  const [hh] = h.split(':').map(Number)
  const suffix = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 || 12
  return `${h12}:00 ${suffix}`
}

const today = new Date().toISOString().split('T')[0]

// ── Cálculo de Pascua (algoritmo anónimo gregoriano) ──────────────────────────
function getEasterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day   = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

// Obtiene el n-ésimo lunes del mes (n=1 primer lunes, n=3 tercer lunes, etc.)
function getNthMonday(year, month, n) {
  const d = new Date(year, month, 1)
  const offset = (8 - d.getDay()) % 7  // días hasta el primer lunes
  return 1 + offset + (n - 1) * 7
}

// Devuelve un Set con los festivos del año en formato 'YYYY-MM-DD'
function getFestivos(year) {
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

  const festivos = new Set([
    fmt(year, 0, 1),   // 1 enero — Año Nuevo
    fmt(year, 4, 1),   // 1 mayo  — Día del Trabajo
    fmt(year, 8, 16),  // 16 sept — Independencia
    fmt(year, 11, 25), // 25 dic  — Navidad
    // Lunes por decreto
    fmt(year, 1, getNthMonday(year, 1, 1)),   // 1er lunes feb — Constitución
    fmt(year, 2, getNthMonday(year, 2, 3)),   // 3er lunes mar — Juárez
    fmt(year, 10, getNthMonday(year, 10, 3)), // 3er lunes nov — Revolución
  ])

  // Jueves y Viernes Santo
  const easter = getEasterSunday(year)
  const jSanto = new Date(easter); jSanto.setDate(easter.getDate() - 3)
  const vSanto = new Date(easter); vSanto.setDate(easter.getDate() - 2)
  festivos.add(fmt(jSanto.getFullYear(), jSanto.getMonth(), jSanto.getDate()))
  festivos.add(fmt(vSanto.getFullYear(), vSanto.getMonth(), vSanto.getDate()))

  return festivos
}

// Determina si una fecha (YYYY-MM-DD) es festivo o fin de semana
function getTipoDia(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const diaSemana = d.getDay() // 0=dom, 6=sab
  if (diaSemana === 0) return 'domingo'
  if (diaSemana === 6) return 'sabado'
  const festivos = getFestivos(d.getFullYear())
  if (festivos.has(dateStr)) return 'festivo'
  return 'normal'
}

function getHorasDisponibles(dateStr) {
  const tipo = getTipoDia(dateStr)
  if (tipo === 'domingo') return []

  const horas = tipo === 'normal' ? HORAS_COMPLETO : HORAS_REDUCIDO

  // Si es hoy, filtrar horas que ya pasaron (dejar solo las futuras)
  if (dateStr === today) {
    const ahoraHH = new Date().getHours()
    return horas.filter(h => parseInt(h.split(':')[0]) > ahoraHH)
  }

  return horas
}

function getLeyenda(dateStr) {
  const tipo = getTipoDia(dateStr)
  if (tipo === 'domingo') return 'Los domingos no hay servicio disponible. Por favor elige otro día.'
  if (tipo === 'festivo') return 'Día festivo:horario de atención: 9:00 AM a 1:00 PM'
  if (tipo === 'sabado')  return 'Fin de semana: horario de atención: 9:00 AM a 1:00 PM'
  return null
}

export default function ServicioAgendar() {
  const { user, getToken } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    modelo_auto: '',
    placas: '',
    servicio: '',
    detalles_falla: '',
    fecha: '',
    hora: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [citaCreada, setCitaCreada] = useState(null)
  const errorRef = useRef(null)
  const successRef = useRef(null)

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const mostrarError = (msg) => {
    setError(msg)
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.modelo_auto.trim()) { mostrarError('Ingresa el modelo de tu vehículo.'); return }
    if (!form.placas.trim()) { mostrarError('Ingresa las placas de tu vehículo.'); return }
    const placasRegex = /^[A-Z0-9]{1,7}$/
    if (!placasRegex.test(form.placas.trim().toUpperCase())) {
      mostrarError('Las placas deben tener máximo 7 caracteres alfanuméricos (solo letras y números).')
      return
    }
    if (!form.servicio) { mostrarError('Selecciona el tipo de servicio.'); return }
    if (!form.fecha) { mostrarError('Selecciona una fecha.'); return }
    if (getTipoDia(form.fecha) === 'domingo') { mostrarError('Los domingos no hay servicio disponible. Por favor elige otro día.'); return }
    if (!form.hora) { mostrarError('Selecciona un horario.'); return }

    // Normalizar teléfono: tomar solo los últimos 10 dígitos (elimina +52 u otro prefijo)
    const telRaw = (user.telefono || '').replace(/\D/g, '')
    const tel10 = telRaw.slice(-10)

    setSubmitting(true)
    try {
      const res = await fetch('/api/servicio/citas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          cliente: `${user.first_name} ${user.last_name}`.trim() || user.email,
          telefono: tel10,
          modelo_auto: form.modelo_auto.trim(),
          placas: form.placas.trim().toUpperCase(),
          servicio: form.servicio,
          detalles_falla: form.detalles_falla.trim(),
          fecha: form.fecha,
          hora: form.hora + ':00',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const firstKey = Object.keys(data)[0]
        const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
        throw new Error(msg || 'Error al agendar la cita.')
      }
      setCitaCreada(data)
      setSuccess(true)
      setTimeout(() => successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) {
      mostrarError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero compacto */}
      <section className="bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
            Taller de Servicio — Ford Guerrero
          </p>
          <h1 className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none">
            Agenda tu cita<span className="text-blue-500">.</span>
          </h1>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">

          {!user ? (
            /* No autenticado */
            <div className="bg-white border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-[#003478] mx-auto mb-6 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <h2 className="font-black text-2xl text-gray-900 tracking-tight mb-3">
                Para agendar una cita debes registrarte primero
              </h2>
              <p className="text-sm text-gray-500 font-light mb-8 max-w-md mx-auto leading-relaxed">
                Con tu cuenta puedes seguir el avance de tu vehículo, cancelar citas y dejar comentarios
                al finalizar el servicio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/registro"
                  className="px-8 py-3.5 bg-[#003478] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#002560] transition-colors rounded-none"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  to="/login"
                  state={{ from: '/servicio/agendar' }}
                  className="px-8 py-3.5 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase hover:bg-zinc-900 hover:text-white transition-colors rounded-none"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>

          ) : success ? (
            /* Éxito */
            <div ref={successRef} className="bg-white border border-gray-200 p-12 text-center">
              <div className="w-14 h-14 bg-green-50 border border-green-200 mx-auto mb-6 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">Cita registrada</p>
              <h2 className="font-black text-3xl text-gray-900 tracking-tight mb-4">
                ¡Tu cita fue agendada!
              </h2>

              {citaCreada && (
                <div className="mt-8 text-left border border-gray-200 divide-y divide-gray-100 mb-8">
                  {[
                    { label: 'Folio', value: `#${String(citaCreada.id).padStart(4, '0')}` },
                    { label: 'Vehículo', value: `${citaCreada.modelo_auto} — ${citaCreada.placas}` },
                    { label: 'Servicio', value: SERVICIOS.find(s => s.value === citaCreada.servicio)?.label || citaCreada.servicio },
                    { label: 'Fecha', value: new Date(citaCreada.fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { label: 'Hora', value: formatHora(citaCreada.hora) },
                    { label: 'Estatus', value: citaCreada.estatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between px-6 py-3 gap-4">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0">{label}</span>
                      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/servicio/mis-citas"
                  className="px-8 py-3.5 bg-[#003478] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#002560] transition-colors rounded-none"
                >
                  Ver mis citas
                </Link>
                <button
                  onClick={() => { setSuccess(false); setCitaCreada(null); setForm({ modelo_auto: '', placas: '', servicio: '', detalles_falla: '', fecha: '', hora: '' }) }}
                  className="px-8 py-3.5 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase hover:border-gray-900 hover:text-gray-900 transition-colors rounded-none"
                >
                  Agendar otra cita
                </button>
              </div>
            </div>

          ) : (
            /* Formulario */
            <div className="bg-white border border-gray-200 p-10">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">
                  Agendando como: <span className="font-semibold text-gray-700">{user.first_name} {user.last_name}</span>
                </p>
                <p className="text-xs text-gray-400 font-light">
                  Tel: {user.telefono ? (user.telefono.replace(/\D/g, '').slice(-10)) : 'Sin teléfono registrado'}
                </p>
              </div>

              {error && (
                <div ref={errorRef} className="mb-6 p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700 font-light">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>

                {/* Modelo del auto */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Modelo del vehículo *
                  </label>
                  <input
                    type="text"
                    value={form.modelo_auto}
                    onChange={(e) => set('modelo_auto', e.target.value)}
                    placeholder="Ej: Ford Ranger 2022"
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                  />
                </div>

                {/* Placas */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Placas *
                  </label>
                  <input
                    type="text"
                    value={form.placas}
                    onChange={(e) => set('placas', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                    placeholder="Ej: ABC1234"
                    maxLength={7}
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors font-mono tracking-widest"
                  />
                </div>

                {/* Tipo de servicio */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                    Tipo de servicio *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICIOS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set('servicio', value)}
                        className={`py-3 px-4 text-xs font-medium tracking-widest uppercase border transition-all duration-200 rounded-none text-left focus:outline-none focus:ring-1 focus:ring-zinc-900 ${
                          form.servicio === value
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detalles de la falla */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Descripción de la falla <span className="normal-case text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    value={form.detalles_falla}
                    onChange={(e) => set('detalles_falla', e.target.value)}
                    rows={3}
                    placeholder="Describe el problema o qué tipo de mantenimiento necesitas..."
                    className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 resize-none font-light mt-1"
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={form.fecha}
                    min={today}
                    onChange={(e) => { set('fecha', e.target.value); set('hora', '') }}
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 transition-colors"
                  />
                  {/* Leyenda día festivo / fin de semana */}
                  {form.fecha && getLeyenda(form.fecha) && (
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 font-light">
                      {getLeyenda(form.fecha)}
                    </p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                    Horario *
                  </label>
                  {!form.fecha ? (
                    <p className="text-sm text-gray-400 font-light">Selecciona primero una fecha.</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {getHorasDisponibles(form.fecha).map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => set('hora', h)}
                          className={`py-2.5 text-xs font-medium tracking-wide uppercase border transition-all duration-200 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 ${
                            form.hora === h
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'
                          }`}
                        >
                          {formatHora(h)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#003478] text-white text-sm font-medium tracking-widest uppercase hover:bg-[#002560] transition-colors rounded-none disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {submitting ? 'Agendando...' : 'Confirmar cita de servicio'}
                </button>

              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
