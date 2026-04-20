import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'

/* Count-up animado desde 0 hasta `end` */
function useCountUp(end, duration = 550) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (end === 0) { setCount(0); return }
    const startTime = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)   // ease-out cubic
      setCount(Math.round(eased * end))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [end, duration])
  return count
}

const KPI = ({ label, value, sub, delay = 0 }) => {
  const animated = useCountUp(value)
  return (
    <div
      className="bg-white border border-gray-100 p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</p>
      <p className="font-black text-4xl text-gray-900 tracking-tight leading-none">{animated}</p>
      {sub && <p className="text-xs text-gray-400 font-light mt-2 tracking-wide">{sub}</p>}
    </div>
  )
}

const KPISkeleton = () => (
  <div className="bg-white border border-gray-100 p-6">
    <div className="h-2.5 w-20 skeleton rounded mb-4" />
    <div className="h-10 w-10 skeleton rounded mb-3" />
    <div className="h-2 w-24 skeleton rounded" />
  </div>
)

const ESTATUS_SERVICIO_STYLES = {
  Pendiente:   'bg-amber-50 text-amber-700 border border-amber-200',
  'En Proceso':'bg-blue-50 text-blue-700 border border-blue-200',
  Terminado:   'bg-green-50 text-green-700 border border-green-200',
  Cancelado:   'bg-red-50 text-red-600 border border-red-200',
}

function EstatusServicioBadge({ value }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-none ${ESTATUS_SERVICIO_STYLES[value] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {value}
    </span>
  )
}

export default function ClienteDashboard() {
  const { getToken } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Citas de servicio
  const [citasServicio, setCitasServicio] = useState([])
  const [loadingServicio, setLoadingServicio] = useState(true)

  useEffect(() => {
    fetch('/api/citas/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar citas')
        return r.json()
      })
      .then((data) => setCitas(Array.isArray(data) ? data : data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => {
    fetch('/api/servicio/citas/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((data) => setCitasServicio(Array.isArray(data) ? data : data.results || []))
      .catch(() => setCitasServicio([]))
      .finally(() => setLoadingServicio(false))
  }, [getToken])

  const pendientes = citas.filter((c) => c.estado === 'pendiente').length
  const confirmadas = citas.filter((c) => c.estado === 'confirmada').length
  const completadas = citas.filter((c) => c.estado === 'completada').length
  const canceladas = citas.filter((c) => c.estado === 'cancelada').length

  const proximas = citas
    .filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada')
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora))
    .slice(0, 5)

  const formatFecha = (iso) => {
    const d = new Date(iso)
    return d.toLocaleString('es-MX', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Resumen</p>
        <h1 className="font-black text-3xl text-gray-900 tracking-tight">Panel de Control</h1>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <KPISkeleton key={i} />)}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 tracking-wide">{error}</p>
      )}

      {!loading && !error && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPI label="Pendientes" value={pendientes} sub="Por confirmar" delay={0} />
            <KPI label="Confirmadas" value={confirmadas} sub="Agendadas" delay={60} />
            <KPI label="Completadas" value={completadas} sub="Finalizadas" delay={120} />
            <KPI label="Canceladas" value={canceladas} sub="Total" delay={180} />
          </div>

          {/* Próximas citas */}
          <div className="bg-white border border-gray-100 animate-fade-up" style={{ animationDelay: '220ms' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                Próximas citas
              </p>
              <Link
                to="/cliente/citas"
                className="text-xs text-gray-400 hover:text-gray-900 tracking-wide transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {proximas.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400 font-light mb-4">No tienes citas próximas agendadas.</p>
                <Link
                  to="/prueba-de-manejo"
                  className="inline-block px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none"
                >
                  Agendar prueba de manejo
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Fecha y hora', 'Asesor', 'Vehículo', 'Estado'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proximas.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-light whitespace-nowrap">
                        {formatFecha(c.fecha_hora)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {c.vendedor_nombre || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-light">
                        {c.vehiculo_nombre || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge value={c.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Citas de Servicio */}
          <div className="bg-white border border-gray-100 animate-fade-up mt-6" style={{ animationDelay: '300ms' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                Mis Citas de Servicio
              </p>
              <Link
                to="/servicio/mis-citas"
                className="text-xs text-gray-400 hover:text-gray-900 tracking-wide transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {loadingServicio ? (
              <div className="px-6 py-6 space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-10 skeleton rounded" />
                ))}
              </div>
            ) : citasServicio.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400 font-light mb-4">No tienes citas de servicio registradas.</p>
                <Link
                  to="/servicio/agendar"
                  className="inline-block px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none"
                >
                  Agendar servicio
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Fecha', 'Hora', 'Servicio', 'Vehículo', 'Placas', 'Estatus'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citasServicio.map((c, i) => {
                    const [hh] = (c.hora || '').split(':').map(Number)
                    const suffix = hh < 12 ? 'AM' : 'PM'
                    const h12 = hh % 12 || 12
                    return (
                      <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-light whitespace-nowrap">{c.fecha}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-light whitespace-nowrap">{`${h12}:00 ${suffix}`}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{c.servicio}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-light">{c.modelo_auto}</td>
                        <td className="px-6 py-4 text-sm font-mono tracking-wider text-gray-500">{c.placas}</td>
                        <td className="px-6 py-4">
                          <EstatusServicioBadge value={c.estatus} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
