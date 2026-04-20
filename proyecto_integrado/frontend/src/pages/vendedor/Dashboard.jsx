import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'

/* Count-up animado desde 0 hasta `end` */
function useCountUp(end, duration = 550) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!end) { setCount(0); return }
    const startTime = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
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

export default function VendedorDashboard() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getToken()
    fetch('/api/vendedores/estadisticas/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar estadísticas')
        return r.json()
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [getToken])

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
        <h1 className="font-black text-3xl text-gray-900 tracking-tight">Dashboard</h1>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <KPISkeleton key={i} />)}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 tracking-wide">{error}</p>
      )}

      {stats && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPI label="Citas Pendientes" value={stats.citas_pendientes} sub="Sin confirmar" delay={0} />
            <KPI label="Confirmadas" value={stats.citas_confirmadas} sub="Agendadas" delay={60} />
            <KPI label="Citas Hoy" value={stats.citas_hoy} sub="Activas para hoy" delay={120} />
            <KPI label="Completadas" value={stats.citas_completadas_mes} sub="Este mes" delay={180} />
          </div>

          {/* Próximas citas */}
          <div className="bg-white border border-gray-100 animate-fade-up" style={{ animationDelay: '220ms' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                Próximas citas
              </p>
              <Link
                to="/vendedor/citas"
                className="text-xs text-gray-400 hover:text-gray-900 tracking-wide transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            {stats.proximas_citas.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400 font-light">No tienes citas próximas agendadas.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Fecha y hora', 'Cliente', 'Vehículo', 'Estado'].map((h) => (
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
                  {stats.proximas_citas.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-light whitespace-nowrap">
                        {formatFecha(c.fecha_hora)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{c.cliente}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-light">
                        {c.vehiculo || <span className="text-gray-300">—</span>}
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
        </>
      )}
    </div>
  )
}
