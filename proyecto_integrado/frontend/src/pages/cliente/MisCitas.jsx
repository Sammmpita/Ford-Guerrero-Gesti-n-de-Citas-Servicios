import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]

const formatFecha = (iso) =>
  new Date(iso).toLocaleString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function MisCitas() {
  const { getToken } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const cargarCitas = useCallback(() => {
    setLoading(true)
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
    cargarCitas()
  }, [cargarCitas])

  const handleCancelar = async (citaId) => {
    setCancelling(citaId)
    setMsg('')
    setError('')
    try {
      const res = await fetch(`/api/citas/${citaId}/cancelar/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'No se pudo cancelar la cita')
      }
      setMsg('Cita cancelada correctamente.')
      cargarCitas()
    } catch (e) {
      setError(e.message)
    } finally {
      setCancelling(null)
    }
  }

  const citasFiltradas = filtroEstado
    ? citas.filter((c) => c.estado === filtroEstado)
    : citas

  const puedeCancel = (estado) => estado === 'pendiente' || estado === 'confirmada'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Historial</p>
        <h1 className="font-black text-3xl text-gray-900 tracking-tight">Mis Citas</h1>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 tracking-wide">{error}</p>}
      {msg && <p className="mb-4 text-sm text-green-600 tracking-wide">{msg}</p>}

      {/* Filtro */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ESTADOS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltroEstado(value)}
            className={`px-4 py-2 text-xs font-medium tracking-widest uppercase border transition-all duration-200 rounded-none ${
              filtroEstado === value
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-white text-gray-500 border-gray-200 hover:border-zinc-400 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 font-light">Cargando...</p>
        ) : citasFiltradas.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 font-light">
            No hay citas{filtroEstado ? ` con estado "${filtroEstado}"` : ''}.
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Fecha y hora', 'Asesor', 'Vehículo', 'Motivo', 'Estado', ''].map((h, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-widest text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((c, i) => (
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
                  <td className="px-6 py-4 text-sm text-gray-500 font-light max-w-[200px] truncate">
                    {c.motivo || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={c.estado} />
                  </td>
                  <td className="px-6 py-4">
                    {puedeCancel(c.estado) && (
                      <button
                        disabled={cancelling === c.id}
                        onClick={() => handleCancelar(c.id)}
                        className="px-3 py-1 text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 tracking-wide transition-all duration-200 rounded-none disabled:opacity-50"
                      >
                        {cancelling === c.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
