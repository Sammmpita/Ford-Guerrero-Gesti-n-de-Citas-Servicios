import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Car, CalendarCheck, CreditCard, RotateCcw, MessageSquare, Wrench } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FordLogo = () => (
  <img
    src="/Ford_logo.png"
    alt="Ford"
    className="h-8 w-auto"
    draggable="false"
  />
)

const LINKS = [
  { label: 'Vehículos',      to: '/vehiculos',      icon: Car          },
  { label: 'Agendar Cita',   to: '/citas',          icon: CalendarCheck },
  { label: 'Servicio',       to: '/servicio',       icon: Wrench        },
  { label: 'Financiamiento', to: '/financiamiento', icon: CreditCard   },
  { label: 'Seminuevos',     to: '/seminuevos',     icon: RotateCcw    },
  { label: 'Contacto',       to: '/contacto',       icon: MessageSquare },
]

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <FordLogo />
        </Link>

        {/* Links de navegación — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`relative text-sm font-medium tracking-wide pb-1 flex items-center gap-1.5
                         after:absolute after:bottom-0 after:left-0 after:h-px
                         after:bg-zinc-900 after:transition-all after:duration-300
                         hover:after:w-full hover:text-zinc-900
                         ${
                           pathname === to
                             ? 'text-zinc-900 after:w-full'
                             : 'text-gray-600 after:w-0'
                         }`}
            >
              <Icon size={15} className="opacity-60" />
              {label}
            </Link>
          ))}
        </div>

        {/* Botones de auth — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-light tracking-wide">
                Hola, <span className="font-medium text-gray-900">{user.first_name || user.email}</span>
              </span>
              {user.rol === 'admin' && (
                <Link
                  to="/admin"
                  className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-none hover:bg-zinc-800 transition-colors ml-4 mr-2 flex items-center"
                >
                  Panel Admin
                </Link>
              )}
              {user.rol === 'vendedor' && (
                <Link
                  to="/vendedor"
                  className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-none hover:bg-zinc-800 transition-colors ml-4 mr-2 flex items-center"
                >
                  Mi Panel
                </Link>
              )}
              {user.rol === 'cliente' && (
                <Link
                  to="/cliente"
                  className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-none hover:bg-zinc-800 transition-colors ml-4 mr-2 flex items-center"
                >
                  Mi Cuenta
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-zinc-900 hover:text-zinc-900 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="px-5 py-2 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
        >
          <span
            className={`block w-6 h-px bg-zinc-900 transition-all duration-300 origin-center ${
              menuAbierto ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-6 h-px bg-zinc-900 transition-all duration-300 ${
              menuAbierto ? 'opacity-0 scale-x-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-px bg-zinc-900 transition-all duration-300 origin-center ${
              menuAbierto ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Menú expandido — mobile */}
      <div
        className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-all duration-300 ease-out ${
          menuAbierto ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          {LINKS.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium tracking-widest uppercase transition-colors duration-200 flex items-center gap-2 ${
                pathname === to ? 'text-zinc-900' : 'text-gray-600'
              }`}
              onClick={() => setMenuAbierto(false)}
            >
              <Icon size={16} className="opacity-50" />
              {label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
            {user ? (
              <>
                <p className="text-xs text-gray-500 font-light">
                  Hola, <span className="font-medium text-gray-900">{user.first_name || user.email}</span>
                </p>
                {user.rol === 'cliente' && (
                  <Link
                    to="/cliente"
                    onClick={() => setMenuAbierto(false)}
                    className="w-full text-center px-5 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-800 rounded-none"
                  >
                    Mi Cuenta
                  </Link>
                )}
                {user.rol === 'vendedor' && (
                  <Link
                    to="/vendedor"
                    onClick={() => setMenuAbierto(false)}
                    className="w-full text-center px-5 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-800 rounded-none"
                  >
                    Mi Panel
                  </Link>
                )}
                {user.rol === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuAbierto(false)}
                    className="w-full text-center px-5 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-800 rounded-none"
                  >
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-zinc-900 hover:text-zinc-900 rounded-none"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full text-center px-5 py-3 border border-zinc-900 text-zinc-900 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full text-center px-5 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:bg-zinc-800 rounded-none"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
