import { useState } from 'react'

// Silueta geométrica de auto como placeholder de imagen
const AutoPlaceholder = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <svg
      width="96"
      height="48"
      viewBox="0 0 96 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-20"
    >
      <path
        d="M10 34 L15 20 L26 12 L70 12 L82 20 L86 34 L10 34Z"
        fill="#71717a"
      />
      <circle cx="26" cy="36" r="7" fill="#71717a" />
      <circle cx="70" cy="36" r="7" fill="#71717a" />
      <path d="M30 12 L36 4 L60 4 L66 12" fill="#9ca3af" />
    </svg>
  </div>
)

const VehiculoCard = ({
  modelo = 'Ford Mustang Mach-E',
  categoria = 'ELÉCTRICO',
  precio = '$1,250,000',
  imagen = null,
  version = null,
  anio = null,
  onVerDetalles = null,
  index = 0,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div
      className="border border-gray-100 hover:border-[#003478]/30 bg-white overflow-hidden rounded-none
                 transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform
                 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,52,120,0.12)] cursor-pointer group
                 animate-fade-up"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      {/* Imagen o placeholder */}
      <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
        {imagen ? (
          <>
            {!imageLoaded && <AutoPlaceholder />}
            <img
              src={imagen}
              alt={modelo}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-[opacity,transform] duration-300 group-hover:scale-105
                ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            />
          </>
        ) : (
          <AutoPlaceholder />
        )}

        {/* Badge de categoría sobre la imagen */}
        <span className="absolute top-3 left-3 bg-[#003478]/90 text-white text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 backdrop-blur-sm">
          {categoria}
        </span>

        {/* Overlay azul en hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00274C]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6 border-l-4 border-transparent group-hover:border-[#003478] transition-[border-color] duration-300">
        {/* Nombre del modelo */}
        <h3 className="font-bold text-xl text-gray-900 tracking-tight leading-tight">
          {modelo}
        </h3>

        {/* Versión y año */}
        {(version || anio) && (
          <p className="mt-1 text-xs text-gray-400 font-medium tracking-wide uppercase">
            {[version, anio].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Precio en monospace */}
        <p className="mt-3 font-mono text-[#003478] text-lg font-semibold">
          {precio}
        </p>

        {/* Botón que se revela al hacer hover — solo opacity + translate (GPU, sin layout) */}
        <div className="mt-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-200 ease-out">
          <button
            onClick={onVerDetalles}
            className="w-full px-4 py-2.5 bg-[#003478] text-white text-xs font-medium tracking-widest uppercase transition-colors duration-200 hover:bg-[#00274C] rounded-none focus:outline-none focus:ring-1 focus:ring-[#003478] focus:ring-offset-2 flex items-center justify-center gap-2">
            Ver detalles
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VehiculoCard
