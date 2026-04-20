import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const formatPrecio = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)

const ESTADO_LABEL = {
  disponible: { label: 'Disponible', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  reservado:  { label: 'Reservado',  cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  vendido:    { label: 'Vendido',    cls: 'bg-red-50    text-red-700    border-red-200'    },
  inactivo:   { label: 'Inactivo',   cls: 'bg-gray-100  text-gray-500   border-gray-200'   },
}

export default function VehiculoDetalle({ vehiculo, onClose }) {
  const imagenes = vehiculo?.imagenes || []
  const principalIdx = imagenes.findIndex((i) => i.es_principal)
  const [activa, setActiva] = useState(principalIdx >= 0 ? principalIdx : 0)
  const navigate = useNavigate()

  // Cerrar con Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!vehiculo) return null

  const imgActiva = imagenes[activa]?.imagen || null
  const estado = ESTADO_LABEL[vehiculo.estado] || ESTADO_LABEL.inactivo

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Línea de acento */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#003478] to-[#4a90d9] z-10" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-zinc-900 transition-colors"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* ── GALERÍA ──────────────────────────────────────────────────────── */}
          <div className="md:w-3/5 flex flex-col bg-gray-100 min-h-[300px]">
            {/* Imagen principal */}
            <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-4">
              {imgActiva ? (
                <img
                  src={imgActiva}
                  alt={vehiculo.modelo}
                  className="absolute inset-0 w-full h-full object-contain p-6 transition-opacity duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-2 p-4 bg-white border-t border-gray-100 overflow-x-auto">
                {imagenes.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiva(i)}
                    className={`flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all duration-200 ${
                      activa === i ? 'border-[#003478]' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.imagen} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO ─────────────────────────────────────────────────────────── */}
          <div className="md:w-2/5 p-8 flex flex-col gap-6 pt-10">
            {/* Categoría + estado */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                {vehiculo.categoria?.nombre || 'Vehículo'}
              </span>
              <span className={`text-[10px] uppercase tracking-widest font-medium px-2 py-1 border ${estado.cls}`}>
                {estado.label}
              </span>
            </div>

            {/* Nombre */}
            <div>
              <h2 className="font-black text-3xl tracking-tight leading-none text-gray-900">
                Ford {vehiculo.modelo}
              </h2>
              {(vehiculo.version || vehiculo.anio) && (
                <p className="mt-2 text-xs uppercase tracking-widest text-gray-400 font-medium">
                  {[vehiculo.version, vehiculo.anio].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            {/* Precio */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Precio</p>
              <p className="font-mono text-2xl text-gray-900 font-bold">
                {formatPrecio(vehiculo.precio)}
              </p>
            </div>

            {/* Especificaciones */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">Especificaciones</p>

              {vehiculo.color && (
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Color</span>
                  <span className="text-sm text-gray-900 font-medium">{vehiculo.color}</span>
                </div>
              )}

              {vehiculo.anio && (
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Año</span>
                  <span className="text-sm font-mono text-gray-900">{vehiculo.anio}</span>
                </div>
              )}

              {vehiculo.kilometraje !== undefined && vehiculo.kilometraje !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Kilometraje</span>
                  <span className="text-sm font-mono text-gray-900">
                    {vehiculo.kilometraje === 0
                      ? '0 km — Nuevo'
                      : `${new Intl.NumberFormat('es-MX').format(vehiculo.kilometraje)} km`}
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {vehiculo.descripcion && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-2">Descripción</p>
                <p className="text-sm font-light text-gray-600 leading-relaxed">
                  {vehiculo.descripcion}
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="border-t border-gray-100 pt-4 mt-auto space-y-3">
              <button
                type="button"
                onClick={() => { onClose(); navigate(`/citas?vehiculo=${vehiculo.id}#agendar`) }}
                className="block w-full py-3 bg-[#003478] text-white text-xs font-medium uppercase tracking-widest text-center transition-all duration-200 hover:bg-[#00274C] focus:outline-none focus:ring-1 focus:ring-[#003478] focus:ring-offset-2"
              >
                Agendar Cita
              </button>
              <Link
                to="/financiamiento"
                onClick={onClose}
                className="block w-full py-3 border border-gray-300 text-gray-600 text-xs font-medium uppercase tracking-widest text-center transition-all duration-200 hover:border-[#003478] hover:text-[#003478] focus:outline-none"
              >
                Ver Financiamiento
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
