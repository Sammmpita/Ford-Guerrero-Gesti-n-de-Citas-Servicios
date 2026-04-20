import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard & Reportes',     to: '/admin' },
  { label: 'Inventario & Categorías',  to: '/admin/vehiculos' },
  { label: 'Gestión de Citas',         to: '/admin/citas' },
  { label: 'Control de Usuarios',      to: '/admin/usuarios' },
]

const NAV_SERVICIO = [
  { label: 'Dashboard de Servicio',    to: '/servicio/dashboard' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user?.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-black text-3xl tracking-tight text-gray-900 mb-2">
            Acceso denegado
          </h1>
          <p className="text-sm text-gray-500 font-light tracking-wide">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-gray-400 flex flex-col flex-shrink-0">
        {/* Sidebar Header */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <span className="text-white font-black text-sm tracking-widest">
            FORD ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 rounded-none ${
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Sección Taller de Servicio */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="px-4 mb-2 text-[10px] uppercase tracking-widest text-zinc-600 font-medium">
              Taller
            </p>
            {NAV_SERVICIO.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 rounded-none ${
                    isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Django Admin link */}
          <a
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium tracking-wide text-gray-500 hover:text-amber-400 transition-all duration-200 mt-4 border-t border-zinc-800 pt-5"
          >
            Django Admin (Backend)
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="flex-shrink-0">
              <path d="M4 1h7v7M11 1L4.5 7.5" />
            </svg>
          </a>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-6 py-5 border-t border-zinc-800">
          <p className="text-xs text-gray-500 font-mono tracking-wide truncate mb-3">
            {user.email}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-zinc-400 hover:text-white rounded-none mb-2"
          >
            ← Página principal
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:border-red-500 hover:text-red-400 rounded-none"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 flex-shrink-0">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Panel de Administración
          </p>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-gray-500 font-light tracking-wide">
              {user.first_name} {user.last_name}
            </span>
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </header>

        {/* Content */}
        <main className="p-8 overflow-y-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
