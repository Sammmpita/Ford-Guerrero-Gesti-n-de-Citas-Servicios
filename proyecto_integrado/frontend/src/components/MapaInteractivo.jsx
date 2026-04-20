// Coordenadas de Ford Guerrero — Av. Farallón No. 18, Acapulco
const POSICION = { lat: 16.872132, lng: -99.868984 }
const ZOOM = 17

const EMBED_URL =
  `https://maps.google.com/maps?q=${POSICION.lat},${POSICION.lng}&z=${ZOOM}&hl=es&output=embed`

const MapaInteractivo = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      <iframe
        title="Ubicación Ford Guerrero — Av. Farallón No. 18, Acapulco"
        src={EMBED_URL}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, minHeight: '400px', display: 'block' }}
        allowFullScreen
      />

      {/* Tarjeta de info flotante */}
      <div className="absolute bottom-6 left-6 bg-white shadow-xl shadow-black/10 rounded-xl px-5 py-4 max-w-[220px] z-10 border border-gray-100">
        <p className="text-[10px] uppercase tracking-widest text-[#003478] font-semibold mb-1">
          Ford Guerrero
        </p>
        <p className="text-xs text-gray-700 leading-relaxed mb-3">
          Av. Farallón No. 18 esq.<br />Rancho Acapulco, Gro.
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${POSICION.lat},${POSICION.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#003478] hover:text-blue-700 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
          </svg>
          Cómo llegar
        </a>
      </div>
    </div>
  )
}

export default MapaInteractivo
