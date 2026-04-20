import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ESTATUS_STYLES = {
  Pendiente:    'bg-amber-50 text-amber-700 border border-amber-200',
  'En Proceso': 'bg-blue-50 text-blue-700 border border-blue-200',
  Terminado:    'bg-green-50 text-green-700 border border-green-200',
  Cancelado:    'bg-red-50 text-red-600 border border-red-200',
}

const FILTROS = [
  { value: '', label: 'Todos' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En Proceso', label: 'En Proceso' },
  { value: 'Terminado', label: 'Terminado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

function EstatusBadge({ value }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-none ${ESTATUS_STYLES[value] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {value}
    </span>
  )
}

const formatHora = (h) => {
  if (!h) return '—'
  const [hh] = h.split(':').map(Number)
  const suffix = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 || 12
  return `${h12}:00 ${suffix}`
}

export default function MisCitasServicio() {
  const { getToken } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const cargar = useCallback(() => {
    setLoading(true)
    fetch('/api/servicio/citas/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar citas de servicio')
        return r.json()
      })
      .then((data) => setCitas(Array.isArray(data) ? data : data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => { cargar() }, [cargar])

  const handleCancelar = async (citaId) => {
    setCancelling(citaId)
    setMsg('')
    setError('')
    try {
      const res = await fetch(`/api/servicio/citas/${citaId}/cancelar/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivo: 'Cancelado por el cliente' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'No se pudo cancelar la cita')
      }
      setMsg('Cita cancelada correctamente.')
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setCancelling(null)
    }
  }

  const citasFiltradas = filtro ? citas.filter((c) => c.estatus === filtro) : citas
  const puedeCancel = (estatus) => estatus === 'Pendiente' || estatus === 'En Proceso'

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Taller</p>
          <h1 className="font-black text-3xl text-gray-900 tracking-tight">Mis Citas de Servicio</h1>
        </div>
        <Link
          to="/servicio/agendar"
          className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none"
        >
          + Agendar servicio
        </Link>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 tracking-wide">{error}</p>}
      {msg && <p className="mb-4 text-sm text-green-600 tracking-wide">{msg}</p>}

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTROS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltro(value)}
            className={`px-4 py-2 text-xs font-medium tracking-widest uppercase border transition-all duration-200 rounded-none ${
              filtro === value
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
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 font-light mb-4">
              No hay citas de servicio{filtro ? ` con estatus "${filtro}"` : ''}.
            </p>
            {!filtro && (
              <Link
                to="/servicio/agendar"
                className="inline-block px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none"
              >
                Agendar servicio
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Fecha', 'Hora', 'Servicio', 'Vehículo', 'Placas', 'Estatus', ''].map((h, idx) => (
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
                  <td className="px-6 py-4 text-sm text-gray-900 font-light whitespace-nowrap">{c.fecha}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-light whitespace-nowrap">{formatHora(c.hora)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.servicio}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-light">{c.modelo_auto}</td>
                  <td className="px-6 py-4 text-sm font-mono tracking-wider text-gray-500">{c.placas}</td>
                  <td className="px-6 py-4">
                    <EstatusBadge value={c.estatus} />
                  </td>
                  <td className="px-6 py-4">
                    {puedeCancel(c.estatus) && (
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
