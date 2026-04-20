import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import SlideOver from '../../components/admin/SlideOver'
import StatusBadge from '../../components/admin/StatusBadge'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]

const TRANSICIONES = {
  pendiente: [
    { estado: 'confirmada', label: 'Confirmar', style: 'border-green-300 text-green-700 hover:bg-green-50' },
    { estado: 'cancelada', label: 'Rechazar', style: 'border-red-300 text-red-700 hover:bg-red-50' },
  ],
  confirmada: [
    { estado: 'completada', label: 'Completar', style: 'border-blue-300 text-blue-700 hover:bg-blue-50' },
    { estado: 'no_asistio', label: 'No asistió', style: 'border-orange-300 text-orange-700 hover:bg-orange-50' },
    { estado: 'cancelada', label: 'Cancelar', style: 'border-red-300 text-red-700 hover:bg-red-50' },
  ],
}

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
  const [selected, setSelected] = useState(null)
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [busquedaCliente, setBusquedaCliente] = useState('')

  const cargarCitas = useCallback(() => {
    setLoading(true)
    fetch('/api/citas/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then(setCitas)
      .catch(() => setError('Error al cargar citas'))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => {
    cargarCitas()
  }, [cargarCitas])

  const handleEstado = async (cita, nuevoEstado) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/citas/${cita.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error('No se pudo actualizar el estado')
      cargarCitas()
      if (selected?.id === cita.id) setSelected((p) => ({ ...p, estado: nuevoEstado }))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGuardarNotas = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/citas/${selected.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ notas_vendedor: notas }),
      })
      if (!res.ok) throw new Error('No se pudieron guardar las notas')
      cargarCitas()
      setSelected(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const abrirDetalle = (cita) => {
    setSelected(cita)
    setNotas(cita.notas_vendedor || '')
  }

  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado && c.estado !== filtroEstado) return false
    if (!busquedaCliente.trim()) return true
    const q = busquedaCliente.toLowerCase()
    const nombre = `${c.cliente?.first_name || ''} ${c.cliente?.last_name || ''}`.toLowerCase()
    const email = (c.cliente?.email || '').toLowerCase()
    const telefono = (c.cliente?.telefono || '').toLowerCase()
    return nombre.includes(q) || email.includes(q) || telefono.includes(q)
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Agenda</p>
        <h1 className="font-black text-3xl text-gray-900 tracking-tight">Mis Citas</h1>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-500 tracking-wide">{error}</p>
      )}

      {/* Buscador de clientes */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
            placeholder="Buscar cliente por nombre, email o teléfono..."
            className="w-full pl-9 pr-8 py-2 border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors rounded-none"
          />
          {busquedaCliente && (
            <button
              type="button"
              onClick={() => setBusquedaCliente('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

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
                {['Fecha y hora', 'Cliente', 'Vehículo', 'Estado', 'Acciones'].map((h) => (
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
              {citasFiltradas.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4 text-sm text-gray-900 font-light whitespace-nowrap">
                    {formatFecha(c.fecha_hora)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {c.cliente.first_name} {c.cliente.last_name}
                    </p>
                    <p className="text-xs text-gray-400 font-light">{c.cliente.telefono || c.cliente.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-light">
                    {c.vehiculo
                      ? `${c.vehiculo.modelo} ${c.vehiculo.anio}`
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={c.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(TRANSICIONES[c.estado] || []).map(({ estado, label, style }) => (
                        <button
                          key={estado}
                          disabled={saving}
                          onClick={() => handleEstado(c, estado)}
                          className={`px-3 py-1 text-xs font-medium border tracking-wide transition-all duration-200 rounded-none disabled:opacity-50 ${style}`}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => abrirDetalle(c)}
                        className="px-3 py-1 text-xs font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 tracking-wide transition-all duration-200 rounded-none"
                      >
                        Detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SlideOver detalle */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Detalle de cita"
      >
        {selected && (
          <div className="flex flex-col gap-6">
            {/* Info */}
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Fecha y hora</p>
                <p className="text-sm text-gray-900">{formatFecha(selected.fecha_hora)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Cliente</p>
                <p className="text-sm text-gray-900">
                  {selected.cliente.first_name} {selected.cliente.last_name}
                </p>
                <p className="text-xs text-gray-400 font-light">{selected.cliente.email}</p>
                {selected.cliente.telefono && (
                  <p className="text-xs text-gray-400 font-light">{selected.cliente.telefono}</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Vehículo</p>
                <p className="text-sm text-gray-900">
                  {selected.vehiculo
                    ? `${selected.vehiculo.modelo} ${selected.vehiculo.anio}`
                    : 'No especificado'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Motivo</p>
                <p className="text-sm text-gray-500 font-light">
                  {selected.motivo || 'Sin especificar'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Estado</p>
                <StatusBadge value={selected.estado} />
              </div>
            </div>

            {/* Acciones de estado */}
            {TRANSICIONES[selected.estado] && (
              <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-4">
                {TRANSICIONES[selected.estado].map(({ estado, label, style }) => (
                  <button
                    key={estado}
                    disabled={saving}
                    onClick={() => handleEstado(selected, estado)}
                    className={`px-4 py-2 text-xs font-medium border tracking-wide transition-all duration-200 rounded-none disabled:opacity-50 ${style}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Notas del vendedor */}
            <div className="border-t border-gray-100 pt-4">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-medium block mb-2">
                Notas internas
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={4}
                placeholder="Añade notas sobre esta cita..."
                className="w-full border-b border-gray-200 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-2 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light resize-none transition-colors"
              />
              <button
                disabled={saving}
                onClick={handleGuardarNotas}
                className="mt-4 w-full px-4 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 rounded-none"
              >
                {saving ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}
