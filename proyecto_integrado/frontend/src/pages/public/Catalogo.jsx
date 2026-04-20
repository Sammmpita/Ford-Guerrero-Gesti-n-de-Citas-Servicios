import { useState } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import VehiculoCard from '../../components/VehiculoCard'
import VehiculoDetalle from '../../components/VehiculoDetalle'
import useVehiculos from '../../hooks/useVehiculos'

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(precio)

const getImagen = (v) => {
  const imgs = v.imagenes || []
  return (imgs.find((i) => i.es_principal) || imgs[0])?.imagen || null
}

// ── Skeleton de carga ─────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div className="border border-gray-100 overflow-hidden">
    <div className="aspect-video w-full skeleton" />
    <div className="p-6 flex flex-col gap-3">
      <div className="h-3 w-16 skeleton rounded" />
      <div className="h-5 w-3/4 skeleton rounded" />
      <div className="h-3 w-1/2 skeleton rounded" />
      <div className="h-5 w-1/3 skeleton rounded" />
    </div>
  </div>
)

// ── Componente principal ──────────────────────────────────────────────────────

const Catalogo = () => {
  const { vehiculos, categorias, loading, error } = useVehiculos()
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const [seleccionado, setSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const lista = vehiculos.filter((v) => {
    const coincideCategoria = categoriaActiva === 'Todos' || v.categoria?.nombre === categoriaActiva
    if (!coincideCategoria) return false
    if (!busqueda.trim()) return true
    const q = busqueda.toLowerCase()
    return (
      (v.modelo || '').toLowerCase().includes(q) ||
      (v.version || '').toLowerCase().includes(q) ||
      (v.marca || '').toLowerCase().includes(q) ||
      (v.color || '').toLowerCase().includes(q)
    )
  })

  const tabs = ['Todos', ...categorias.map((c) => c.nombre)]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] pt-24 pb-16 overflow-hidden">
        {/* SVG decorativo de silueta de auto */}
        <svg
          viewBox="0 0 600 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-16 top-1/2 -translate-y-1/2 w-[500px] md:w-[600px] opacity-[0.07] pointer-events-none select-none"
          aria-hidden="true"
        >
          <path d="M60 170 L90 100 L140 60 L380 60 L450 100 L490 170 L60 170Z" stroke="white" strokeWidth="3" />
          <circle cx="140" cy="180" r="35" stroke="white" strokeWidth="3" />
          <circle cx="140" cy="180" r="18" stroke="white" strokeWidth="2" />
          <circle cx="390" cy="180" r="35" stroke="white" strokeWidth="3" />
          <circle cx="390" cy="180" r="18" stroke="white" strokeWidth="2" />
          <path d="M160 60 L190 25 L340 25 L370 60" stroke="white" strokeWidth="2.5" />
          <line x1="260" y1="60" x2="260" y2="25" stroke="white" strokeWidth="2" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="uppercase text-xs tracking-widest text-blue-300 font-medium mb-4">
            Catálogo completo
          </p>
          <h1 className="font-black text-5xl md:text-6xl text-white tracking-tight leading-none">
            Modelos Ford<span className="text-blue-400">.</span>
          </h1>
          <p className="mt-6 text-blue-200/70 font-light text-base max-w-lg leading-relaxed">
            Explora nuestra línea completa de vehículos. Pickups de trabajo, SUVs familiares,
            eléctricos de vanguardia y deportivos icónicos.
          </p>
          {!loading && !error && (
            <p className="mt-4 font-mono text-xs text-blue-300/60 tracking-wider">
              {lista.length} vehículo{lista.length !== 1 ? 's' : ''} disponible{lista.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Línea de acento inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-transparent" />
      </section>

      {/* ── FILTROS DE CATEGORÍA ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Buscador */}
          <div className="pt-3">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por modelo, versión, color..."
                className="w-full pl-6 pr-8 py-2 border-0 border-b border-gray-200 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 focus:outline-none transition-colors"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
            {tabs.map((tab) => {
              const q = busqueda.toLowerCase()
              const matchSearch = (v) => !busqueda.trim() || (v.modelo || '').toLowerCase().includes(q) || (v.version || '').toLowerCase().includes(q) || (v.marca || '').toLowerCase().includes(q) || (v.color || '').toLowerCase().includes(q)
              const count = tab === 'Todos'
                ? vehiculos.filter(matchSearch).length
                : vehiculos.filter((v) => v.categoria?.nombre === tab && matchSearch(v)).length
              return (
                <button
                  key={tab}
                  onClick={() => setCategoriaActiva(tab)}
                  className={`flex-shrink-0 px-4 py-2 text-xs font-medium uppercase tracking-widest
                    rounded-full transition-all duration-200 focus:outline-none
                    ${categoriaActiva === tab
                      ? 'bg-[#003478] text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  {tab}
                  {!loading && (
                    <span className={`ml-1.5 text-[10px] ${categoriaActiva === tab ? 'text-blue-200' : 'text-gray-300'}`}>
                      ({count})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── GRID DE VEHÍCULOS ──────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          {/* Estado de error */}
          {error && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-light text-sm">
                No se pudo cargar el catálogo. Intenta de nuevo más tarde.
              </p>
            </div>
          )}

          {/* Skeletons de carga */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Grid real */}
          {!loading && !error && lista.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lista.map((v, i) => (
                <VehiculoCard
                  key={v.id}
                  index={i}
                  modelo={v.modelo}
                  categoria={v.categoria?.nombre?.toUpperCase() || ''}
                  precio={formatPrecio(v.precio)}
                  imagen={getImagen(v)}
                  version={v.version}
                  anio={v.anio}
                  onVerDetalles={() => setSeleccionado(v)}
                />
              ))}
            </div>
          )}

          {/* Sin resultados para la categoría seleccionada */}
          {!loading && !error && lista.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-32 h-16 mb-6 opacity-20">
                <path d="M12 42 L20 24 L34 16 L86 16 L100 24 L108 42 L12 42Z" stroke="#003478" strokeWidth="2" />
                <circle cx="34" cy="46" r="8" stroke="#003478" strokeWidth="2" />
                <circle cx="86" cy="46" r="8" stroke="#003478" strokeWidth="2" />
                <path d="M38 16 L46 6 L74 6 L82 16" stroke="#003478" strokeWidth="1.5" />
                <line x1="60" y1="16" x2="60" y2="6" stroke="#003478" strokeWidth="1.5" />
              </svg>
              <p className="text-gray-400 font-light text-sm">
                {busqueda.trim()
                  ? `No se encontraron vehículos para “${busqueda}”${categoriaActiva !== 'Todos' ? ` en ${categoriaActiva}` : ''}.`
                  : 'No hay vehículos en esta categoría.'}
              </p>
              {busqueda.trim() && (
                <button
                  type="button"
                  onClick={() => { setBusqueda(''); setCategoriaActiva('Todos') }}
                  className="mt-4 text-xs uppercase tracking-widest text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      <Footer />

      {/* Modal detalle */}
      {seleccionado && (
        <VehiculoDetalle
          vehiculo={seleccionado}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </div>
  )
}

export default Catalogo
