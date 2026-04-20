import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProfileAvatar({ user, size = 'md' }) {
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  const dim = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-10 h-10 text-xs'

  return (
    <span
      className={`${dim} rounded-full bg-zinc-800 ring-1 ring-zinc-600 flex items-center justify-center flex-shrink-0 font-semibold tracking-widest text-zinc-200`}
    >
      {initials}
    </span>
  )
}

const NAV_ITEMS = [
  { label: 'Dashboard',    to: '/encargado' },
  { label: 'Bahía Express',      to: '/encargado/bahia/Express' },
  { label: 'Bahía Media',        to: '/encargado/bahia/Medio' },
  { label: 'Bahía Largo Plazo',  to: '/encargado/bahia/Largo' },
  { label: 'Bahía Contingencia', to: '/encargado/bahia/Contingencia' },
]

export default function EncargadoLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user?.rol !== 'encargado') {
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
        {/* Header */}
        <div className="px-6 py-6 border-b border-zinc-800">
          <span className="text-white font-black text-sm tracking-widest">
            FORD TALLER
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/encargado'}
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
        </nav>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <ProfileAvatar user={user} size="md" />
            <div className="min-w-0">
              <p className="text-xs text-gray-300 font-medium tracking-wide truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-600 tracking-wide truncate">
                {user.email}
              </p>
            </div>
          </div>
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
            Taller de Servicio
          </p>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-gray-500 font-light tracking-wide">
              {user.first_name} {user.last_name}
            </span>
            <div className="relative">
              <ProfileAvatar user={user} size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-1 ring-white" />
            </div>
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
