import { useState } from 'react'
import { MapPin, Phone } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

// ── Datos mock ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { id: 'suv', label: 'SUVs' },
  { id: 'hibrido', label: 'Híbridos' },
  { id: 'pickup', label: 'Pickups' },
  { id: 'electrico', label: 'Eléctricos' },
  { id: 'sedan', label: 'Sedanes' },
]

const CATALOGO = [
  {
    id: 1,
    name: 'TERRITORY HÍBRIDA 2026',
    categoria: 'hibrido',
    price: 719900,
    versions: [
      { id: 'trend-hev', label: 'TREND HEV', price: 719900 },
      { id: 'titanium-hev', label: 'TITANIUM HEV', price: 819900 },
    ],
  },
  {
    id: 2,
    name: 'BRONCO SPORT 2026',
    categoria: 'suv',
    price: 689900,
    versions: [
      { id: 'big-bend', label: 'BIG BEND', price: 689900 },
      { id: 'outer-banks', label: 'OUTER BANKS', price: 789900 },
      { id: 'badlands', label: 'BADLANDS', price: 879900 },
    ],
  },
  {
    id: 3,
    name: 'EXPLORER 2026',
    categoria: 'suv',
    price: 899900,
    versions: [
      { id: 'xlt', label: 'XLT', price: 899900 },
      { id: 'limited', label: 'LIMITED', price: 1049900 },
    ],
  },
  {
    id: 4,
    name: 'MAVERICK 2026',
    categoria: 'pickup',
    price: 485000,
    versions: [
      { id: 'xl', label: 'XL', price: 485000 },
      { id: 'xlt-mav', label: 'XLT', price: 549900 },
      { id: 'lariat', label: 'LARIAT', price: 619900 },
    ],
  },
  {
    id: 5,
    name: 'MUSTANG MACH-E 2026',
    categoria: 'electrico',
    price: 1250000,
    versions: [
      { id: 'select', label: 'SELECT RWD', price: 1250000 },
      { id: 'premium', label: 'PREMIUM AWD', price: 1450000 },
    ],
  },
  {
    id: 6,
    name: 'F-150 2026',
    categoria: 'pickup',
    price: 980000,
    versions: [
      { id: 'stx', label: 'STX', price: 980000 },
      { id: 'lariat-f150', label: 'LARIAT', price: 1150000 },
    ],
  },
]

const PLAZOS = [12, 24, 36, 48]
const TASA_ANUAL = 6.06

// ── Placeholder SVG ───────────────────────────────────────────────────────────

const AutoPlaceholder = ({ size = 'md' }) => {
  const dims = size === 'lg' ? { w: 120, h: 60 } : { w: 96, h: 48 }
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <svg
        width={dims.w}
        height={dims.h}
        viewBox="0 0 96 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-20"
      >
        <path d="M10 34 L15 20 L26 12 L70 12 L82 20 L86 34 L10 34Z" fill="#71717a" />
        <circle cx="26" cy="36" r="7" fill="#71717a" />
        <circle cx="70" cy="36" r="7" fill="#71717a" />
        <path d="M30 12 L36 4 L60 4 L66 12" fill="#9ca3af" />
      </svg>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatMoney = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)

const calcMensualidad = (saldo, plazoMeses, tasaAnual) => {
  const r = tasaAnual / 100 / 12
  if (r === 0) return saldo / plazoMeses
  return (saldo * r) / (1 - Math.pow(1 + r, -plazoMeses))
}

// ── Stepper ───────────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Modelo' },
  { num: 2, label: 'Calculadora' },
  { num: 3, label: 'Contacto' },
]

const Stepper = ({ currentStep }) => (
  <div className="flex items-center justify-center mt-10">
    {STEPS.map((step, i) => (
      <div key={step.num} className="flex items-center">
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center justify-center w-6 h-6 font-mono text-xs transition-colors duration-300 ${
              currentStep >= step.num
                ? 'bg-zinc-900 text-white'
                : 'border border-gray-300 text-gray-400'
            }`}
          >
            {step.num}
          </span>
          <span
            className={`uppercase text-xs tracking-widest transition-colors duration-300 ${
              currentStep >= step.num
                ? 'font-bold text-zinc-900'
                : 'font-medium text-gray-400'
            }`}
          >
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className="h-px bg-gray-200 w-16 mx-4" />
        )}
      </div>
    ))}
  </div>
)

// ── Modal de versiones ────────────────────────────────────────────────────────

const VersionModal = ({ car, onSelect, onClose }) => {
  if (!car) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-none max-w-3xl w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-zinc-900 transition-colors duration-300"
          aria-label="Cerrar modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-2">
          Selecciona versión
        </p>
        <h2 className="font-black text-3xl tracking-tight text-gray-900 mb-8">
          {car.name}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {car.versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onSelect(car, version)}
              className="flex items-center justify-between p-6 border border-gray-200
                         hover:border-zinc-900 hover:bg-gray-50
                         transition-all duration-300 ease-out group text-left"
            >
              <div>
                <span className="uppercase text-xs tracking-widest text-gray-400 font-medium">
                  {car.name}
                </span>
                <p className="font-bold text-lg text-gray-900 tracking-tight mt-1">
                  {version.label}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-mono text-lg text-zinc-900">
                  {formatMoney(version.price)}
                </span>
                <span className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase
                                 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  Seleccionar
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Ticket / Recibo de cotización ─────────────────────────────────────────────

const CotizacionReceipt = ({ vehicle, version, financingData }) => {
  const precio = version?.price || 0
  const engancheAmount = Math.round(precio * (financingData.enganche / 100))
  const seguroAmount = financingData.seguroFinanciado ? Math.round(precio * 0.045) : 0
  const inversionInicial = engancheAmount + seguroAmount
  const saldoFinanciar = precio - engancheAmount
  const mensualidad = calcMensualidad(saldoFinanciar, financingData.plazo, TASA_ANUAL)

  const rows = [
    { label: 'Precio del vehículo', value: formatMoney(precio) },
    { label: 'Enganche', value: formatMoney(engancheAmount), sub: `${financingData.enganche}%` },
    { label: 'Seguro anual', value: financingData.seguroFinanciado ? formatMoney(seguroAmount) : '—' },
    { label: 'Total inversión inicial', value: formatMoney(inversionInicial), bold: true },
    { label: 'Saldo a financiar', value: formatMoney(saldoFinanciar) },
    { label: 'Tasa anual fija', value: `${TASA_ANUAL}%` },
    { label: 'Plazo', value: `${financingData.plazo} meses` },
  ]

  return (
    <div className="bg-gray-50 border border-gray-200 p-8 sticky top-8">
      <h4 className="uppercase tracking-widest text-xs font-bold text-gray-900 mb-6">
        Detalles del financiamiento
      </h4>

      <div className="flex flex-col">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between py-3 border-b border-gray-100 text-sm ${
              row.bold ? 'font-medium' : ''
            }`}
          >
            <span className="text-gray-500 font-light">{row.label}</span>
            <div className="flex items-center gap-2">
              {row.sub && (
                <span className="text-xs text-gray-400 font-mono">{row.sub}</span>
              )}
              <span className="font-mono text-zinc-900">{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 text-white p-6 mt-6 flex flex-col items-center">
        <span className="uppercase text-[10px] tracking-widest text-gray-400 font-medium mb-2">
          Mensualidad estimada
        </span>
        <span className="font-black font-mono text-4xl tracking-tighter">
          {formatMoney(Math.round(mensualidad))}
        </span>
      </div>

      <p className="text-[10px] text-gray-400 leading-tight mt-6">
        * Cotización estimada con fines informativos. Tasa, plazo y condiciones
        sujetos a aprobación crediticia. No incluye comisión por apertura ni gastos
        de gestión. Consulta términos y condiciones en sucursal. Ford Credit México,
        S.A. de C.V.
      </p>
    </div>
  )
}

// ── Resumen del auto (columna izquierda en Steps 2 y 3) ───────────────────────

const VehicleSummary = ({ vehicle, version, onChangeVehicle }) => (
  <div>
    <div className="aspect-video w-full mb-6 overflow-hidden">
      <AutoPlaceholder size="lg" />
    </div>
    <span className="uppercase text-xs tracking-widest text-gray-400 font-medium">
      {version?.label}
    </span>
    <h3 className="font-black text-xl uppercase tracking-tight text-gray-900 mt-1">
      {vehicle?.name}
    </h3>
    <p className="font-mono text-lg text-gray-900 mt-2 mb-4">
      {formatMoney(version?.price || 0)}
    </p>
    <button
      onClick={onChangeVehicle}
      className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1
                 hover:border-zinc-900 inline-block transition-colors duration-300
                 text-gray-500 hover:text-zinc-900"
    >
      Cambiar vehículo
    </button>
  </div>
)

// ── Step 1: Selección de modelo ───────────────────────────────────────────────

const Step1 = ({ onSelectCar, selectedCategory, setSelectedCategory }) => {
  const filtered = selectedCategory
    ? CATALOGO.filter((c) => c.categoria === selectedCategory)
    : CATALOGO

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 py-12">
      {/* Sidebar de categorías */}
      <div className="md:col-span-1">
        <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-6">
          Categorías
        </p>
        <button
          onClick={() => setSelectedCategory(null)}
          className={`block w-full text-left py-3 border-b border-gray-100 text-sm tracking-wide
                     uppercase transition-transform duration-300 hover:translate-x-1 ${
                       !selectedCategory ? 'text-zinc-900 font-bold' : 'text-gray-500 font-light'
                     }`}
        >
          Todos
        </button>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`block w-full text-left py-3 border-b border-gray-100 text-sm tracking-wide
                       uppercase transition-transform duration-300 hover:translate-x-1 ${
                         selectedCategory === cat.id
                           ? 'text-zinc-900 font-bold'
                           : 'text-gray-500 font-light'
                       }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Catálogo de autos */}
      <div className="md:col-span-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((car) => (
            <div
              key={car.id}
              className="border border-gray-100 hover:border-gray-300 bg-white overflow-hidden
                         transition-all duration-300 ease-out hover:-translate-y-1
                         hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)] cursor-pointer group"
              onClick={() => onSelectCar(car)}
            >
              <div className="aspect-video w-full overflow-hidden">
                <AutoPlaceholder />
              </div>
              <div className="p-6">
                <span className="uppercase text-xs tracking-widest text-gray-400 font-medium">
                  {CATEGORIAS.find((c) => c.id === car.categoria)?.label || car.categoria}
                </span>
                <h3 className="mt-2 font-bold text-lg text-gray-900 tracking-tight leading-tight">
                  {car.name}
                </h3>
                <p className="mt-3 font-mono text-gray-900">
                  Desde {formatMoney(car.price)}
                </p>
                <div className="transition-all duration-300 ease-out overflow-hidden max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 group-hover:mt-5">
                  <span className="block w-full px-4 py-2.5 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase text-center transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none">
                    Configurar modelo
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <h3 className="font-black text-2xl text-gray-900 tracking-tight mb-2">
              Sin modelos disponibles
            </h3>
            <p className="font-light text-gray-500 text-sm">
              No hay vehículos en esta categoría por el momento.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 2: Calculadora de financiamiento ─────────────────────────────────────

const Step2 = ({ financingData, setFinancingData, onNext, onBack }) => (
  <div className="flex flex-col gap-10">
    <div>
      <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-2">
        Paso 2
      </p>
      <h3 className="font-black text-2xl tracking-tight text-gray-900">
        Configura tu plan
      </h3>
    </div>

    {/* Plazo */}
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
        Plazo (meses)
      </label>
      <div className="grid grid-cols-4 gap-2">
        {PLAZOS.map((p) => (
          <button
            key={p}
            onClick={() => setFinancingData((prev) => ({ ...prev, plazo: p }))}
            className={`py-3 text-sm font-mono tracking-wide transition-all duration-300 ease-out
                       focus:outline-none focus:ring-1 focus:ring-zinc-900 ${
                         financingData.plazo === p
                           ? 'bg-zinc-900 text-white'
                           : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                       }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>

    {/* Enganche */}
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
        Enganche
      </label>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-zinc-900 text-lg">
          {financingData.enganche}%
        </span>
      </div>
      <div className="relative w-full">
        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={financingData.enganche}
          onChange={(e) =>
            setFinancingData((prev) => ({
              ...prev,
              enganche: parseInt(e.target.value, 10),
            }))
          }
          className="w-full appearance-none h-1 bg-gray-200 outline-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-zinc-900 [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:bg-zinc-900 [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400 font-mono">10%</span>
        <span className="text-xs text-gray-400 font-mono">60%</span>
      </div>
    </div>

    {/* Seguro financiado */}
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
        ¿Incluir seguro financiado?
      </label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Sí', val: true },
          { label: 'No', val: false },
        ].map((opt) => (
          <button
            key={String(opt.val)}
            onClick={() =>
              setFinancingData((prev) => ({ ...prev, seguroFinanciado: opt.val }))
            }
            className={`py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-out
                       focus:outline-none focus:ring-1 focus:ring-zinc-900 ${
                         financingData.seguroFinanciado === opt.val
                           ? 'bg-zinc-900 text-white'
                           : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                       }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    {/* Navegación */}
    <div className="flex gap-3 pt-4">
      <button
        onClick={onBack}
        className="px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-wide
                   uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white
                   rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
      >
        Regresar
      </button>
      <button
        onClick={onNext}
        className="px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase
                   transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800
                   rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
      >
        Continuar
      </button>
    </div>
  </div>
)

// ── Step 3: Formulario de contacto ────────────────────────────────────────────

const Step3 = ({ onBack }) => {
  const [contactForm, setContactForm] = useState({
    email: '',
    nombre: '',
    apellidos: '',
    telefono: '',
    comentarios: '',
  })

  const handleChange = (e) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: conectar con endpoint POST /api/cotizaciones/
    console.log('Solicitud enviada:', contactForm)
  }

  const fields = [
    { name: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com', autoComplete: 'email' },
    { name: 'nombre', label: 'Nombre(s)', type: 'text', placeholder: 'Juan', autoComplete: 'given-name' },
    { name: 'apellidos', label: 'Apellidos', type: 'text', placeholder: 'García López', autoComplete: 'family-name' },
    { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '744 123 4567', autoComplete: 'tel' },
  ]

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-2">
          Paso 3
        </p>
        <h3 className="font-black text-2xl tracking-tight text-gray-900 mb-1">
          Datos de contacto
        </h3>
        <p className="font-light text-gray-500 text-sm">
          Un asesor se pondrá en contacto contigo para formalizar tu solicitud.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={`fin-${field.name}`}
              className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
            >
              {field.label}
            </label>
            <input
              id={`fin-${field.name}`}
              type={field.type}
              name={field.name}
              value={contactForm[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                         focus:border-zinc-900 focus:ring-0 bg-transparent w-full
                         text-gray-900 placeholder:text-gray-400 placeholder:font-light
                         transition-colors duration-300"
            />
          </div>
        ))}

        {/* Comentarios */}
        <div>
          <label
            htmlFor="fin-comentarios"
            className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1"
          >
            Comentarios
          </label>
          <textarea
            id="fin-comentarios"
            name="comentarios"
            value={contactForm.comentarios}
            onChange={handleChange}
            rows={3}
            placeholder="¿Algún detalle adicional?"
            className="border-0 border-b border-gray-300 rounded-none px-0 py-3
                       focus:border-zinc-900 focus:ring-0 bg-transparent w-full
                       text-gray-900 placeholder:text-gray-400 placeholder:font-light
                       resize-none transition-colors duration-300"
          />
        </div>

        {/* Navegación */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-wide
                       uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white
                       rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Regresar
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase
                       transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800
                       rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Enviar solicitud
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

const Financing = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalCar, setModalCar] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [financingData, setFinancingData] = useState({
    enganche: 20,
    plazo: 36,
    seguroFinanciado: false,
  })

  const handleSelectCar = (car) => {
    setModalCar(car)
    setIsModalOpen(true)
  }

  const handleConfirmVersion = (car, version) => {
    setSelectedVehicle(car)
    setSelectedVersion(version)
    setIsModalOpen(false)
    setModalCar(null)
    setCurrentStep(2)
  }

  const handleChangeVehicle = () => {
    setSelectedVehicle(null)
    setSelectedVersion(null)
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <div className="h-10 bg-[#003478]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <p className="text-xs text-blue-100 font-light tracking-wide flex items-center gap-1.5">
            <MapPin size={13} className="opacity-70" />
            Acapulco, Gro. — Av. Farallón No. 18 esq. Rancho Acapulco
          </p>
          <a href="tel:7441234567" className="font-mono text-xs text-blue-100 tracking-wide flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={12} className="opacity-70" />
            744 123 4567
          </a>
        </div>
      </div>

      <Navbar usuario={null} />

      {/* Header + Stepper */}
      <div className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-black text-5xl tracking-tight text-gray-900 mb-2">
            Financiamiento
          </h1>
          <p className="font-light text-gray-500">
            Diseña un plan a tu medida.
          </p>
          <Stepper currentStep={currentStep} />
        </div>
      </div>

      {/* Contenido del paso activo */}
      {currentStep === 1 && (
        <Step1
          onSelectCar={handleSelectCar}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}

      {(currentStep === 2 || currentStep === 3) && selectedVehicle && (
        <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Columna izquierda — Resumen del auto */}
          <div className="lg:col-span-3">
            <VehicleSummary
              vehicle={selectedVehicle}
              version={selectedVersion}
              onChangeVehicle={handleChangeVehicle}
            />
          </div>

          {/* Columna central — Interacción */}
          <div className="lg:col-span-5">
            {currentStep === 2 && (
              <Step2
                financingData={financingData}
                setFinancingData={setFinancingData}
                onNext={() => setCurrentStep(3)}
                onBack={handleChangeVehicle}
              />
            )}
            {currentStep === 3 && (
              <Step3 onBack={() => setCurrentStep(2)} />
            )}
          </div>

          {/* Columna derecha — Ticket de cotización */}
          <div className="lg:col-span-4">
            <CotizacionReceipt
              vehicle={selectedVehicle}
              version={selectedVersion}
              financingData={financingData}
            />
          </div>
        </div>
      )}

      {/* Modal de versiones */}
      {isModalOpen && (
        <VersionModal
          car={modalCar}
          onSelect={handleConfirmVersion}
          onClose={() => {
            setIsModalOpen(false)
            setModalCar(null)
          }}
        />
      )}

      <Footer />
    </div>
  )
}

export default Financing
