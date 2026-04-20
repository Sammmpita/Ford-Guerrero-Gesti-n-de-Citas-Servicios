import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'
import SlideOver from '../../components/admin/SlideOver'

// Chips de filtro por estado
const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]

// Transiciones de estado permitidas
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

const KPI = ({ label, value }) => (
  <div className="bg-white border border-gray-100 p-5">
    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</p>
    <p className="font-black text-3xl text-gray-900 tracking-tight leading-none">{value}</p>
  </div>
)

export default function ManageAppointments() {
  const { getToken } = useAuth()

  const [citas, setCitas] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroVendedor, setFiltroVendedor] = useState('')

  const [selected, setSelected] = useState(null)
  const [notas, setNotas] = useState('')

  // ── Fetch de datos ───────────────────────────────────────────────
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
    // Cargar lista de vendedores para el filtro (endpoint público)
    fetch('/api/vendedores/lista/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => setVendedores(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
  }, [cargarCitas, getToken])

  // ── Actualizar estado de cita ────────────────────────────────────
  const handleEstado = async (cita, nuevoEstado) => {
    setSaving(true)
    setError('')
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

  // ── Guardar notas del vendedor (desde el SlideOver) ──────────────
  const handleGuardarNotas = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
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

  // ── Filtrado local ───────────────────────────────────────────────
  const citasFiltradas = citas.filter((c) => {
    if (filtroEstado && c.estado !== filtroEstado) return false
    if (filtroVendedor && String(c.vendedor?.id) !== filtroVendedor) return false
    return true
  })

  // ── KPIs ─────────────────────────────────────────────────────────
  const pendientes = citas.filter((c) => c.estado === 'pendiente').length
  const confirmadas = citas.filter((c) => c.estado === 'confirmada').length
  const completadas = citas.filter((c) => c.estado === 'completada').length
  const canceladas = citas.filter((c) => c.estado === 'cancelada').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Sistema</p>
        <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">
          Gestión de Citas
        </h1>
      </div>

      {error && (
        <p className="text-sm text-red-500 tracking-wide">{error}</p>
      )}

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Pendientes" value={pendientes} />
          <KPI label="Confirmadas" value={confirmadas} />
          <KPI label="Completadas" value={completadas} />
          <KPI label="Canceladas" value={canceladas} />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
        {/* Estado — chips */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">Estado</p>
          <div className="flex gap-2 flex-wrap">
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
        </div>

        {/* Vendedor — select */}
        <div className="w-56 shrink-0">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
            Asesor
          </label>
          <select
            value={filtroVendedor}
            onChange={(e) => setFiltroVendedor(e.target.value)}
            className="border-0 border-b border-gray-300 rounded-none px-0 py-2 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 text-sm"
          >
            <option value="">Todos</option>
            {vendedores.map((v) => (
              <option key={v.id} value={String(v.id)}>
                {v.usuario?.first_name} {v.usuario?.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-100">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 font-light">Cargando...</p>
        ) : citasFiltradas.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-black text-lg tracking-tight text-gray-900">Sin resultados</p>
            <p className="text-sm font-light text-gray-500 mt-1">
              No hay citas que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Fecha / Hora', 'Cliente', 'Vehículo', 'Asesor', 'Estado', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citasFiltradas.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-50/60 transition-colors duration-150">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400 tracking-wide">
                    {String(cita.id).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-light whitespace-nowrap">
                    {formatFecha(cita.fecha_hora)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-medium">
                      {cita.cliente?.first_name} {cita.cliente?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 font-light">
                      {cita.cliente?.telefono || cita.cliente?.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-light">
                    {cita.vehiculo
                      ? `${cita.vehiculo.marca} ${cita.vehiculo.modelo} ${cita.vehiculo.anio}`
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {cita.vendedor?.usuario?.first_name} {cita.vendedor?.usuario?.last_name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge value={cita.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(TRANSICIONES[cita.estado] || []).map(({ estado, label, style }) => (
                        <button
                          key={estado}
                          disabled={saving}
                          onClick={() => handleEstado(cita, estado)}
                          className={`px-3 py-1 text-xs font-medium border tracking-wide transition-all duration-200 rounded-none disabled:opacity-50 ${style}`}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => abrirDetalle(cita)}
                        className="px-3 py-1 text-xs font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 tracking-wide transition-all duration-200 rounded-none"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SlideOver — detalle de cita */}
      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Cita #${String(selected?.id || '').padStart(4, '0')}`}
      >
        {selected && (
          <div className="space-y-8">
            {/* Estado actual + transiciones */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Estado</p>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge value={selected.estado} />
                {(TRANSICIONES[selected.estado] || []).map(({ estado, label, style }) => (
                  <button
                    key={estado}
                    disabled={saving}
                    onClick={() => handleEstado(selected, estado)}
                    className={`px-4 py-1.5 text-xs font-medium border tracking-wide transition-all duration-200 rounded-none disabled:opacity-50 ${style}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Datos del cliente */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Cliente</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  {selected.cliente?.first_name} {selected.cliente?.last_name}
                </p>
                <p className="text-sm text-gray-500 font-light">{selected.cliente?.email}</p>
                {selected.cliente?.telefono && (
                  <p className="text-sm text-gray-500 font-light font-mono">{selected.cliente.telefono}</p>
                )}
              </div>
            </div>

            {/* Fecha y duración */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Fecha y hora</p>
              <p className="text-sm text-gray-900">{formatFecha(selected.fecha_hora)}</p>
              <p className="text-xs text-gray-400 font-light mt-1">{selected.duracion_minutos} min de duración</p>
            </div>

            {/* Asesor asignado */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Asesor asignado</p>
              <p className="text-sm text-gray-900">
                {selected.vendedor?.usuario?.first_name} {selected.vendedor?.usuario?.last_name}
              </p>
              {selected.vendedor?.especialidad && (
                <p className="text-xs text-gray-400 font-light mt-1">{selected.vendedor.especialidad}</p>
              )}
            </div>

            {/* Vehículo */}
            {selected.vehiculo && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Vehículo de interés</p>
                <p className="text-sm text-gray-900">
                  {selected.vehiculo.marca} {selected.vehiculo.modelo} {selected.vehiculo.anio}
                </p>
                {selected.vehiculo.version && (
                  <p className="text-xs text-gray-400 font-light mt-1">{selected.vehiculo.version}</p>
                )}
              </div>
            )}

            {/* Motivo */}
            {selected.motivo && (
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Motivo</p>
                <p className="text-sm text-gray-600 font-light leading-relaxed">{selected.motivo}</p>
              </div>
            )}

            {/* Notas del asesor (editable) */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Notas del asesor</p>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={4}
                placeholder="Observaciones internas sobre la cita..."
                className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 resize-none font-light"
              />
              <div className="flex justify-end mt-3">
                <button
                  disabled={saving}
                  onClick={handleGuardarNotas}
                  className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar notas'}
                </button>
              </div>
            </div>

            {/* Metadatos */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Metadatos</p>
              <p className="text-xs text-gray-400 font-light">
                Creada: {formatFecha(selected.fecha_creacion)}
              </p>
              <p className="text-xs text-gray-400 font-light mt-1">
                Actualizada: {formatFecha(selected.fecha_actualizacion)}
              </p>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  )
}
