import { Link } from 'react-router-dom'
import {
  MapPin, Phone, Clock, Mail,
  Car, CalendarCheck, CreditCard, Wrench, ShieldCheck
} from 'lucide-react'

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)
const IconInstagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)
const IconYoutube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
)

const LINKS_VEHICULOS = [
  { label: 'Ford Mustang Mach-E', to: '/vehiculos' },
  { label: 'Ford Maverick',       to: '/vehiculos' },
  { label: 'Ford Bronco',         to: '/vehiculos' },
  { label: 'Ford Explorer',       to: '/vehiculos' },
  { label: 'Ford F-150',          to: '/vehiculos' },
  { label: 'Seminuevos',          to: '/seminuevos' },
]

const LINKS_SERVICIOS = [
  { label: 'Agendar Cita',            to: '/citas',          icon: CalendarCheck },
  { label: 'Financiamiento',          to: '/financiamiento', icon: CreditCard    },
  { label: 'Servicio y Mantenimiento',to: '/contacto',       icon: Wrench        },
  { label: 'Refacciones',             to: '/contacto',       icon: Car           },
  { label: 'Garantía Ford',           to: '/contacto',       icon: ShieldCheck   },
]

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Columna 1: Logo + descripción + redes */}
          <div className="md:col-span-1">
            <Link to="/">
              <img
                src="/Ford_logo.png"
                alt="Ford"
                className="h-10 w-auto brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                draggable="false"
              />
            </Link>
            <p className="mt-5 text-sm font-light text-gray-500 leading-relaxed">
              Concesionaria Ford autorizada en Acapulco, Guerrero. Más de 20 años de experiencia en ventas y servicio automotriz.
            </p>
            {/* Redes sociales */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://www.facebook.com/FordMexico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href="https://www.instagram.com/fordmexico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.youtube.com/@FordMexico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors duration-200"
                aria-label="YouTube"
              >
                <IconYoutube />
              </a>
            </div>
          </div>

          {/* Columna 2: Links de vehículos */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5 flex items-center gap-2">
              <Car size={14} className="opacity-60" />
              Vehículos
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_VEHICULOS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Links de servicios */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5 flex items-center gap-2">
              <Wrench size={14} className="opacity-60" />
              Servicios
            </h4>
            <ul className="flex flex-col gap-3">
              {LINKS_SERVICIOS.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm font-light text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2"
                  >
                    <Icon size={13} className="opacity-40" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Información de contacto */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5 flex items-center gap-2">
              <Phone size={14} className="opacity-60" />
              Contacto
            </h4>
            <div className="flex flex-col gap-5 text-sm font-light">
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <MapPin size={12} className="opacity-60" />
                  Dirección
                </p>
                <a
                  href="https://maps.google.com/?q=Av+Farallón+18+Rancho+Acapulco+Guerrero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed hover:text-white transition-colors duration-200"
                >
                  Av. Farallón No. 18 esq.<br />
                  Rancho Acapulco, Gro.
                </a>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Phone size={12} className="opacity-60" />
                  Teléfono
                </p>
                <a
                  href="tel:7441234567"
                  className="font-mono text-gray-300 hover:text-white transition-colors duration-200"
                >
                  744 123 4567
                </a>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Mail size={12} className="opacity-60" />
                  Correo
                </p>
                <a
                  href="mailto:contacto@fordguerrero.com"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  contacto@fordguerrero.com
                </a>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Clock size={12} className="opacity-60" />
                  Horario
                </p>
                <p>Lun – Sáb</p>
                <p className="font-mono text-gray-300">09:00 – 19:00 hrs</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright y links legales */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © 2026 Ford Guerrero — Acapulco, Gro. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <Link
              to="/contacto"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200"
            >
              Aviso de Privacidad
            </Link>
            <Link
              to="/contacto"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200"
            >
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
