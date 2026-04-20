import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SERVICIOS_LABEL = {
  Preventivo: 'Mantenimiento Preventivo',
  Frenos: 'Sistema de Frenos',
  Suspension: 'Suspensión',
  Electrico: 'Sistema Eléctrico',
  Otro: 'Otro',
}

const ESTATUS_OPCIONES = ['Pendiente', 'En Proceso', 'Terminado', 'Cancelado']
const BAHIAS_OPCIONES = ['Express', 'Medio', 'Largo', 'Contingencia']

const ESTATUS_STYLES = {
  Pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  'En Proceso': 'bg-blue-50 text-blue-700 border border-blue-200',
  Terminado: 'bg-green-50 text-green-700 border border-green-200',
  Cancelado: 'bg-red-50 text-red-600 border border-red-200',
}

function EstatusBadge({ value }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-none ${ESTATUS_STYLES[value] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {value}
    </span>
  )
}

const formatFecha = (fecha, hora) => {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  const fechaStr = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  if (!hora) return fechaStr
  const [hh] = hora.split(':').map(Number)
  const suffix = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 || 12
  return `${fechaStr} — ${h12}:00 ${suffix}`
}

const BAHIA_COLORS = {
  Express: 'from-green-500',
  Medio: 'from-yellow-500',
  Largo: 'from-blue-600',
  Contingencia: 'from-red-600',
}

const BAHIA_LABELS = {
  Express: 'Bahía Express',
  Medio: 'Bahía Media',
  Largo: 'Bahía Largo Plazo',
  Contingencia: 'Bahía Contingencia',
}

// Panel lateral de detalle/edición de cita
function DetalleCita({ cita, onClose, onUpdate, getToken }) {
  const [estatus, setEstatus] = useState(cita.estatus)
  const [bahia, setBahia] = useState(cita.bahia_asignada)
  const [notas, setNotas] = useState(cita.notas_admin || '')
  const [saving, setSaving] = useState(null) // 'estatus' | 'bahia' | 'notas'
  const [error, setError] = useState('')

  const patch = async (url, body, tipo) => {
    setSaving(tipo)
    setError('')
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || JSON.stringify(d))
      }
      const updated = await res.json()
      onUpdate(updated)
      if (tipo === 'notas') onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">
              Cita #{String(cita.id).padStart(4, '0')}
            </p>
            <h2 className="font-black text-xl text-gray-900 tracking-tight">{cita.cliente}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200">
              <p className="text-xs text-red-700 font-light">{error}</p>
            </div>
          )}

          {/* Info del vehículo */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Vehículo</p>
            <p className="text-sm font-medium text-gray-900">{cita.modelo_auto}</p>
            <p className="text-xs text-gray-400 font-mono tracking-widest mt-0.5">{cita.placas}</p>
          </div>

          {/* Info del cliente */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Cliente</p>
            <p className="text-sm text-gray-900">{cita.cliente}</p>
            <p className="text-xs text-gray-500 font-mono font-light mt-0.5">{cita.telefono}</p>
          </div>

          {/* Servicio */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Servicio</p>
            <p className="text-sm text-gray-900 font-medium">{SERVICIOS_LABEL[cita.servicio] || cita.servicio}</p>
            {cita.detalles_falla && (
              <p className="text-xs text-gray-500 font-light mt-2 leading-relaxed">{cita.detalles_falla}</p>
            )}
          </div>

          {/* Fecha y hora */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Fecha y hora</p>
            <p className="text-sm text-gray-900">{formatFecha(cita.fecha, cita.hora)}</p>
          </div>

          {/* Cambiar estatus */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Estatus</p>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <EstatusBadge value={cita.estatus} />
            </div>
            {cita.estatus !== 'Cancelado' && (
              <div className="space-y-2">
                <div className="flex gap-2 flex-wrap">
                  {ESTATUS_OPCIONES.filter(e => e !== cita.estatus).map((e) => (
                    <button
                      key={e}
                      disabled={saving === 'estatus'}
                      onClick={() => patch(`/api/servicio/citas/${cita.id}/estatus/`, { estatus: e }, 'estatus')}
                      className={`px-3 py-1.5 text-xs font-medium border tracking-wide transition-all rounded-none disabled:opacity-50 ${
                        e === 'Cancelado' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                        e === 'Terminado' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                        e === 'En Proceso' ? 'border-blue-300 text-blue-700 hover:bg-blue-50' :
                        'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {saving === 'estatus' ? 'Guardando...' : e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cambiar bahía */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Bahía asignada</p>
            <div className="grid grid-cols-2 gap-2">
              {BAHIAS_OPCIONES.map((b) => (
                <button
                  key={b}
                  disabled={saving === 'bahia'}
                  onClick={() => patch(`/api/servicio/citas/${cita.id}/bahia/`, { bahia: b }, 'bahia')}
                  className={`py-2 text-xs font-medium tracking-widest uppercase border transition-all rounded-none disabled:opacity-50 ${
                    cita.bahia_asignada === b
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-zinc-900 hover:text-zinc-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Notas del taller</p>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
              placeholder="Observaciones internas sobre la reparación..."
              className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 resize-none font-light"
            />
            <div className="flex justify-end mt-2">
              <button
                disabled={saving === 'notas'}
                onClick={() => patch(`/api/servicio/citas/${cita.id}/notas/`, { notas_admin: notas }, 'notas')}
                className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:bg-zinc-700 rounded-none disabled:opacity-50"
              >
                {saving === 'notas' ? 'Guardando...' : 'Guardar notas'}
              </button>
            </div>
          </div>

          {/* Comentario del cliente */}
          {cita.comentario_cliente && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Comentario del cliente</p>
              <div className="bg-gray-50 border border-gray-200 px-4 py-3">
                <p className="text-sm text-gray-700 font-light italic leading-relaxed">"{cita.comentario_cliente}"</p>
              </div>
            </div>
          )}

          {/* Motivo cancelación */}
          {cita.motivo_cancelacion && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">Motivo de cancelación</p>
              <p className="text-sm text-gray-600 font-light">{cita.motivo_cancelacion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ServicioModuloBahia() {
  const { bahia } = useParams()
  const [searchParams] = useSearchParams()
  const { user, getToken } = useAuth()

  const dashboardPath = user?.rol === 'encargado' ? '/encargado' : '/servicio/dashboard'

  const [fecha, setFecha] = useState(
    searchParams.get('fecha') || new Date().toISOString().split('T')[0]
  )
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detalle, setDetalle] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    setError('')
    fetch(`/api/servicio/citas/dashboard/?fecha=${fecha}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar citas')
        return r.json()
      })
      .then((data) => {
        setCitas(data.bahias?.[bahia] || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [fecha, bahia, getToken])

  useEffect(() => { cargar() }, [cargar])

  const handleUpdate = (updated) => {
    setCitas((prev) => prev.map((c) => c.id === updated.id ? updated : c))
    setDetalle(updated)
  }

  if (user?.rol !== 'admin' && user?.rol !== 'encargado') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-black text-xl text-gray-900">Acceso denegado</p>
      </div>
    )
  }

  const colorFrom = BAHIA_COLORS[bahia] || 'from-gray-500'
  const label = BAHIA_LABELS[bahia] || `Bahía ${bahia}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              to={dashboardPath}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Módulo de bahía</p>
          <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">{label}</h1>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 tracking-wide">{error}</p>}

      {/* Selector de fecha */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => {
            const d = new Date(fecha + 'T00:00:00')
            d.setDate(d.getDate() - 1)
            setFecha(d.toISOString().split('T')[0])
          }}
          className="px-4 py-2 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase hover:border-zinc-900 hover:text-zinc-900 transition-colors rounded-none"
        >
          ← Anterior
        </button>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border border-gray-300 rounded-none px-3 py-2 text-sm text-gray-900 focus:border-zinc-900 focus:ring-0"
        />
        <button
          onClick={() => setFecha(new Date().toISOString().split('T')[0])}
          className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-medium tracking-widest uppercase hover:border-zinc-900 hover:text-zinc-900 transition-colors rounded-none"
        >
          Hoy
        </button>
        <button
          onClick={() => {
            const d = new Date(fecha + 'T00:00:00')
            d.setDate(d.getDate() + 1)
            setFecha(d.toISOString().split('T')[0])
          }}
          className="px-4 py-2 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase hover:border-zinc-900 hover:text-zinc-900 transition-colors rounded-none"
        >
          Siguiente →
        </button>
      </div>

      {/* Tabla de citas */}
      <div className="bg-white border border-gray-100">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 font-light">Cargando...</p>
        ) : citas.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-black text-lg tracking-tight text-gray-900">Sin citas para este día</p>
            <p className="text-sm font-light text-gray-500 mt-1">
              No hay citas asignadas a la {label} para el {new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {['#', 'Hora', 'Cliente', 'Vehículo', 'Servicio', 'Estatus', ''].map((h) => (
                  <th key={h} className="px-6 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {citas.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-400 tracking-wide">
                    {String(c.id).padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono whitespace-nowrap">
                    {c.hora ? c.hora.slice(0, 5) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 font-medium">{c.cliente}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.telefono}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 font-light">{c.modelo_auto}</p>
                    <p className="text-xs text-gray-400 font-mono tracking-widest">{c.placas}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-light">
                    {SERVICIOS_LABEL[c.servicio] || c.servicio}
                  </td>
                  <td className="px-6 py-4">
                    <EstatusBadge value={c.estatus} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDetalle(c)}
                      className="px-3 py-1 text-xs font-medium border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 tracking-wide transition-all rounded-none"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Panel de detalle */}
      {detalle && (
        <DetalleCita
          cita={detalle}
          onClose={() => setDetalle(null)}
          onUpdate={handleUpdate}
          getToken={getToken}
        />
      )}
    </div>
  )
}
