import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const BAHIAS = ['Express', 'Medio', 'Largo', 'Contingencia']

const BAHIA_LABELS = {
  Express: 'Express',
  Medio: 'Media',
  Largo: 'Largo Plazo',
  Contingencia: 'Contingencia',
}

const BAHIA_COLORS = {
  Express: 'border-green-400',
  Medio: 'border-yellow-400',
  Largo: 'border-blue-500',
  Contingencia: 'border-red-500',
}

const BAHIA_DOT = {
  Express: 'bg-green-400',
  Medio: 'bg-yellow-400',
  Largo: 'bg-blue-500',
  Contingencia: 'bg-red-500',
}

const ESTATUS_STYLES = {
  Pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  'En Proceso': 'bg-blue-50 text-blue-700 border border-blue-200',
  Terminado: 'bg-green-50 text-green-700 border border-green-200',
  Cancelado: 'bg-red-50 text-red-600 border border-red-200',
}

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

const KPI = ({ label, value, color = 'text-gray-900' }) => (
  <div className="bg-white border border-gray-100 p-5">
    <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</p>
    <p className={`font-black text-3xl tracking-tight leading-none ${color}`}>{value}</p>
  </div>
)

export default function ServicioDashboard() {
  const { user, getToken } = useAuth()
  const navigate = useNavigate()

  const baseBahiaPath = user?.rol === 'encargado' ? '/encargado/bahia' : '/servicio/dashboard/bahia'

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Búsqueda
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)

  const cargar = useCallback(() => {
    setLoading(true)
    setError('')
    fetch(`/api/servicio/citas/dashboard/?fecha=${fecha}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar el dashboard')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [fecha, getToken])

  useEffect(() => { cargar() }, [cargar])

  const buscar = useCallback(async (q) => {
    if (!q.trim()) { setResultados([]); return }
    setBuscando(true)
    try {
      const r = await fetch(`/api/servicio/citas/buscar/?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const d = await r.json()
      setResultados(Array.isArray(d) ? d : [])
    } catch {
      setResultados([])
    } finally {
      setBuscando(false)
    }
  }, [getToken])

  useEffect(() => {
    const t = setTimeout(() => buscar(busqueda), 350)
    return () => clearTimeout(t)
  }, [busqueda, buscar])

  if (user?.rol !== 'admin' && user?.rol !== 'encargado') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="font-black text-2xl tracking-tight text-gray-900 mb-2">Acceso denegado</p>
          <p className="text-sm text-gray-500 font-light">No tienes permisos para ver esta sección.</p>
        </div>
      </div>
    )
  }

  const totalCitas = data ? BAHIAS.reduce((acc, b) => acc + (data.bahias[b]?.length || 0), 0) : 0
  const pendientes = data ? BAHIAS.flatMap(b => data.bahias[b] || []).filter(c => c.estatus === 'Pendiente').length : 0
  const enProceso = data ? BAHIAS.flatMap(b => data.bahias[b] || []).filter(c => c.estatus === 'En Proceso').length : 0
  const terminados = data ? BAHIAS.flatMap(b => data.bahias[b] || []).filter(c => c.estatus === 'Terminado').length : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Taller de Servicio</p>
        <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">
          Dashboard de Servicio
        </h1>
      </div>

      {error && <p className="text-sm text-red-500 tracking-wide">{error}</p>}

      {/* KPIs */}
      {!loading && data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Total hoy" value={totalCitas} />
          <KPI label="Pendientes" value={pendientes} color="text-amber-600" />
          <KPI label="En Proceso" value={enProceso} color="text-blue-600" />
          <KPI label="Terminados" value={terminados} color="text-green-600" />
        </div>
      )}

      {/* Navegación de fecha */}
      <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-3">
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
        </div>
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

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
          Buscar por cliente o placas
        </label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ej: Juan García o ABC-123"
          className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
        />
        {busqueda && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
            {buscando ? (
              <p className="px-4 py-3 text-sm text-gray-400 font-light">Buscando...</p>
            ) : resultados.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400 font-light">Sin resultados.</p>
            ) : (
              resultados.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setBusqueda('')
                    setResultados([])
                    navigate(`${baseBahiaPath}/${c.bahia_asignada || 'Express'}?fecha=${c.fecha}`)
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm font-medium text-gray-900">{c.cliente} — {c.placas}</p>
                  <p className="text-xs text-gray-400 font-light">{c.modelo_auto} · {c.fecha} · <EstatusBadge value={c.estatus} /></p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Grid de Bahías */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BAHIAS.map((b) => (
            <div key={b} className="bg-white border border-gray-100 p-6 animate-pulse">
              <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
              <div className="space-y-3">
                {[0, 1].map((i) => <div key={i} className="h-16 bg-gray-50 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {BAHIAS.map((bahia) => {
            const citas = data.bahias[bahia] || []
            return (
              <div key={bahia} className={`bg-white border border-gray-100 border-t-4 ${BAHIA_COLORS[bahia]}`}>
                {/* Header de bahía */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${BAHIA_DOT[bahia]}`} />
                    <span className="font-bold text-gray-900 text-sm tracking-wide">
                      {BAHIA_LABELS[bahia]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl text-gray-900">{citas.length}</span>
                    <Link
                      to={`${baseBahiaPath}/${bahia}`}
                      className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-zinc-900 transition-colors border-b border-gray-200 hover:border-zinc-900 pb-0.5"
                    >
                      Ver →
                    </Link>
                  </div>
                </div>

                {/* Citas de la bahía */}
                <div className="divide-y divide-gray-50">
                  {citas.length === 0 ? (
                    <p className="px-5 py-8 text-xs text-gray-300 font-light text-center">
                      Sin citas para este día
                    </p>
                  ) : (
                    citas.map((c) => (
                      <div key={c.id} className="px-5 py-3 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-gray-900 leading-tight">{c.cliente}</p>
                          <EstatusBadge value={c.estatus} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono tracking-wider">{c.placas}</p>
                        <p className="text-[11px] text-gray-400 font-light mt-0.5">
                          {c.modelo_auto} · {formatHora(c.hora)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
