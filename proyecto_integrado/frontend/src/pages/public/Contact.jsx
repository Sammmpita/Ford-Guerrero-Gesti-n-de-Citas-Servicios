import { useState } from 'react'
import { MapPin, Phone } from 'lucide-react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import MapaInteractivo from '../../components/MapaInteractivo'

// ── Datos mock ────────────────────────────────────────────────────────────────

const HORARIOS = [
  {
    area: 'Ventas',
    telefono: '744 487 5050',
    dias: [
      { label: 'Lun – Vie', horas: '09:00 AM – 06:30 PM' },
      { label: 'Sábado',    horas: '09:00 AM – 06:30 PM' },
      { label: 'Domingo',   horas: '10:00 AM – 02:00 PM' },
    ],
  },
  {
    area: 'Seminuevos',
    telefono: '744 487 5050',
    dias: [
      { label: 'Lun – Vie', horas: '09:00 AM – 06:30 PM' },
      { label: 'Sábado',    horas: '09:00 AM – 06:30 PM' },
      { label: 'Domingo',   horas: '10:00 AM – 02:00 PM' },
    ],
  },
  {
    area: 'Servicio',
    telefono: '744 487 5050',
    dias: [
      { label: 'Lun – Vie', horas: '09:00 AM – 06:30 PM' },
      { label: 'Sábado',    horas: '09:00 AM – 02:00 PM' },
      { label: 'Domingo',   horas: 'Cerrado' },
    ],
  },
  {
    area: 'Refacciones',
    telefono: '744 487 5050',
    dias: [
      { label: 'Lun – Vie', horas: '09:00 AM – 06:30 PM' },
      { label: 'Sábado',    horas: '09:00 AM – 02:00 PM' },
      { label: 'Domingo',   horas: 'Cerrado' },
    ],
  },
]

const DIRECTORIO = [
  {
    nombre: 'Lizette Manguilar',
    puesto: 'Gerente de Ventas',
    telefono: '744 487 5050',
    email: 'lmanguilar@fordguerrero.mx',
  },
  {
    nombre: 'Fabiola Sandoval',
    puesto: 'Gerente de Servicio',
    telefono: '777 362 4261',
    email: null,
  },
  {
    nombre: 'Carlos Poblete',
    puesto: 'Gerente de Servicio',
    telefono: '744 487 5050',
    email: 'cpoblete@fordguerrero.mx',
  },
]

const TIPOS_MENSAJE  = ['Comentario', 'Sugerencia', 'Queja']
const DEPARTAMENTOS  = ['Ventas', 'Refacciones', 'Servicio', 'Gerencia general']

const FORM_INICIAL = {
  tipo:        'Comentario',
  nombre:      '',
  paterno:     '',
  materno:     '',
  email:       '',
  telefono:    '',
  dirigido:    'Ventas',
  comentario:  '',
  privacidad:  false,
  promociones: false,
}

// ── Componentes auxiliares ─────────────────────────────────────────────────────

// Radio button custom — cuadrado industrial, sin aspecto nativo
const RadioCustom = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <span
      className={`w-4 h-4 border flex items-center justify-center flex-shrink-0
                  transition-all duration-200 rounded-none ${
        checked
          ? 'border-zinc-900 bg-zinc-900'
          : 'border-gray-300 group-hover:border-gray-500'
      }`}
    >
      {checked && (
        <span className="block w-1.5 h-1.5 bg-white rounded-none" />
      )}
    </span>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className="text-sm text-gray-700 font-light">{label}</span>
  </label>
)

// Checkbox custom — cuadrado mínimo, check geométrico
const CheckboxCustom = ({ checked, onChange, label }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <span
      className={`w-4 h-4 mt-0.5 border flex items-center justify-center flex-shrink-0
                  transition-all duration-200 rounded-none ${
        checked
          ? 'border-zinc-900 bg-zinc-900'
          : 'border-gray-300 group-hover:border-gray-500'
      }`}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      )}
    </span>
    <span className="text-xs text-gray-500 font-light leading-relaxed">{label}</span>
  </label>
)

// Tarjeta de horario por área
const HorarioArea = ({ area, telefono, dias }) => (
  <div className="py-5 first:pt-0 last:pb-0">
    <div className="flex items-baseline justify-between mb-2">
      <h4 className="text-xs uppercase tracking-widest text-gray-900 font-medium">
        {area}
      </h4>
      <span className="font-mono text-sm text-gray-500">{telefono}</span>
    </div>
    <div className="flex flex-col gap-1">
      {dias.map(({ label, horas }) => (
        <div key={label} className="flex justify-between text-sm">
          <span className="font-light text-gray-500">{label}</span>
          <span className={`font-mono text-xs tracking-wide ${
            horas === 'Cerrado' ? 'text-red-400' : 'text-gray-600'
          }`}>
            {horas}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Item del directorio
const DirectorioItem = ({ nombre, puesto, telefono, email }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between py-6
                  group hover:bg-gray-50 px-4 -mx-4 transition-colors duration-200">
    <div className="mb-2 md:mb-0">
      <p className="font-bold text-gray-900">{nombre}</p>
      <p className="text-xs uppercase tracking-widest text-gray-400 mt-0.5">{puesto}</p>
    </div>
    <div className="flex flex-col md:items-end gap-0.5">
      <span className="font-mono text-sm text-gray-600">{telefono}</span>
      {email && (
        <a
          href={`mailto:${email}`}
          className="text-sm text-gray-500 hover:text-blue-700 transition-colors duration-200"
        >
          {email}
        </a>
      )}
    </div>
  </div>
)

// ── Componente principal ──────────────────────────────────────────────────────

const Contact = () => {
  const [form, setForm] = useState(FORM_INICIAL)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleRadio = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: conectar con endpoint POST /api/contacto/
    console.log('Formulario de contacto:', form)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="h-10 bg-[#003478]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <p className="text-xs text-blue-100 font-light tracking-wide flex items-center gap-1.5">
            <MapPin size={13} className="opacity-70" />
            Acapulco, Gro. — Av. Farallón No. 18 esq. Rancho Acapulco
          </p>
          <a href="tel:7444875050" className="font-mono text-xs text-blue-100 tracking-wide hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={12} className="opacity-70" />
            744 487 5050
          </a>
        </div>
      </div>

      <Navbar usuario={null} />

      {/* ── SPLIT PRINCIPAL: Formulario (izq) + Mapa (der) ────────────────── */}
      {/* En desktop ocupa exactamente el viewport restante tras topbar+navbar  */}
      <section className="flex flex-col lg:flex-row lg:h-[calc(100vh-104px)]">

        {/* Columna izquierda — título de página + formulario con scroll */}
        <div className="lg:w-1/2 bg-white overflow-y-auto">
          <div className="px-10 py-12 lg:px-14 lg:py-10">

            {/* Header de página — reemplaza el hero eliminado */}
            <p className="uppercase text-xs tracking-widest text-blue-600 font-medium mb-3">
              Atención al cliente
            </p>
            <h1 className="font-black text-4xl lg:text-5xl tracking-tight leading-none">
              Contáctanos<span className="text-blue-500">.</span>
            </h1>
            <p className="font-mono text-xs text-gray-400 mt-3 mb-10">
              <span className="hover:text-gray-600 transition-colors cursor-pointer">Inicio</span>
              {' / '}
              <span>Contacto</span>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

              {/* Tipo de mensaje */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
                  Tipo de mensaje
                </p>
                <div className="flex flex-wrap gap-6">
                  {TIPOS_MENSAJE.map((tipo) => (
                    <RadioCustom
                      key={tipo}
                      name="tipo"
                      value={tipo}
                      checked={form.tipo === tipo}
                      onChange={handleRadio}
                      label={tipo}
                    />
                  ))}
                </div>
              </div>

              {/* Nombre, Apellido Paterno, Apellido Materno */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="ct-nombre" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Nombre(s) *
                  </label>
                  <input
                    id="ct-nombre"
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>
                <div>
                  <label htmlFor="ct-paterno" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Ap. Paterno *
                  </label>
                  <input
                    id="ct-paterno"
                    type="text"
                    name="paterno"
                    value={form.paterno}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>
                <div>
                  <label htmlFor="ct-materno" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Ap. Materno
                  </label>
                  <input
                    id="ct-materno"
                    type="text"
                    name="materno"
                    value={form.materno}
                    onChange={handleChange}
                    autoComplete="additional-name"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>
              </div>

              {/* Email y Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ct-email" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    id="ct-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>
                <div>
                  <label htmlFor="ct-telefono" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Teléfono *
                  </label>
                  <input
                    id="ct-telefono"
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                               focus:border-zinc-900 focus:ring-0 focus:outline-none
                               bg-transparent w-full text-gray-900 font-mono
                               placeholder:text-gray-400 placeholder:font-light"
                  />
                </div>
              </div>

              {/* Dirigido a */}
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-4">
                  Dirigido a
                </p>
                <div className="flex flex-wrap gap-6">
                  {DEPARTAMENTOS.map((dep) => (
                    <RadioCustom
                      key={dep}
                      name="dirigido"
                      value={dep}
                      checked={form.dirigido === dep}
                      onChange={handleRadio}
                      label={dep}
                    />
                  ))}
                </div>
              </div>

              {/* Comentario */}
              <div>
                <label htmlFor="ct-comentario" className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                  Comentario *
                </label>
                <textarea
                  id="ct-comentario"
                  name="comentario"
                  value={form.comentario}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="border-0 border-b border-gray-300 rounded-none px-0 py-2.5
                             focus:border-zinc-900 focus:ring-0 focus:outline-none
                             bg-transparent w-full text-gray-900 resize-none
                             placeholder:text-gray-400 placeholder:font-light"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              {/* Checkboxes legales */}
              <div className="flex flex-col gap-3">
                <CheckboxCustom
                  checked={form.privacidad}
                  onChange={() => setForm({ ...form, privacidad: !form.privacidad })}
                  label="He leído y acepto el Aviso de Privacidad"
                />
                <CheckboxCustom
                  checked={form.promociones}
                  onChange={() => setForm({ ...form, promociones: !form.promociones })}
                  label="No deseo recibir información promocional"
                />
              </div>

              {/* Botón enviar */}
              <div className="flex justify-end pb-2">
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-zinc-900 text-white text-sm font-medium
                             tracking-widest uppercase transition-all duration-300 ease-out
                             hover:-translate-y-px hover:bg-zinc-800 rounded-none
                             focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
                >
                  Enviar mensaje
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Columna derecha — mapa que llena toda la altura disponible */}
        {/* En mobile se muestra con altura fija antes de las secciones inferiores */}
        <div className="lg:w-1/2 h-72 lg:h-full">
          <MapaInteractivo />
        </div>

      </section>

      {/* ── HORARIOS ───────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-8">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 mb-10">
            <div>
              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-2">
                Ubicación
              </p>
              <h2 className="font-bold text-2xl tracking-tight text-gray-900 mb-1">
                Ford Guerrero
              </h2>
              <p className="font-light text-gray-500 text-sm">
                Av. Farallón No. 18 esq. Rancho Acapulco, Garita Acapulco, GUERRERO
              </p>
            </div>
            <a
              href="#"
              className="flex-shrink-0 inline-block px-6 py-2.5 border border-zinc-900 text-zinc-900
                         text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out
                         hover:bg-zinc-900 hover:text-white rounded-none self-start
                         focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Cómo llegar
            </a>
          </div>

          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-200 pb-4">
            Horarios de atención
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HORARIOS.map((h) => (
              <HorarioArea key={h.area} {...h} />
            ))}
          </div>

        </div>
      </section>

      {/* ── DIRECTORIO ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-black text-3xl tracking-tight text-gray-900 leading-none">
            Directorio
          </h2>
          <p className="font-light text-gray-500 mt-3 mb-12">
            Nuestro personal está listo para atenderte.
          </p>
          <div className="flex flex-col divide-y divide-gray-100">
            {DIRECTORIO.map((persona) => (
              <DirectorioItem key={persona.nombre} {...persona} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  )
}

export default Contact




