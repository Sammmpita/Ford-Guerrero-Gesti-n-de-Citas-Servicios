import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const me = await login(form.email, form.password)
      if (from !== '/') {
        navigate(from, { replace: true })
      } else if (me.rol === 'admin') {
        navigate('/admin', { replace: true })
      } else if (me.rol === 'vendedor') {
        navigate('/vendedor', { replace: true })
      } else if (me.rol === 'encargado') {
        navigate('/encargado', { replace: true })
      } else if (me.rol === 'cliente') {
        navigate('/', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">

          {/* Columna izquierda — editorial */}
          <div className="hidden lg:flex flex-col justify-between bg-zinc-900 px-16 py-20">
            <div>
              <p className="uppercase text-xs tracking-widest text-gray-500 font-medium mb-12">
                Agencia Ford — Acapulco
              </p>
              <h1 className="font-black text-5xl text-white tracking-tight leading-none mb-6">
                Bienvenido<br />de vuelta.
              </h1>
              <p className="text-gray-400 font-light leading-relaxed max-w-xs text-sm">
                Accede a tu historial de citas, pruebas de manejo y ofertas personalizadas.
              </p>
            </div>

            <div className="border-t border-zinc-800 pt-8">
              <p className="text-gray-500 font-light text-sm">
                ¿Aún no tienes cuenta?{' '}
                <Link
                  to="/registro"
                  className="text-white font-medium underline underline-offset-4 hover:text-gray-300 transition-colors"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-20">
            <div className="w-full max-w-sm mx-auto">

              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
                Acceso a tu cuenta
              </p>
              <h2 className="font-black text-3xl text-gray-900 tracking-tight leading-none mb-10">
                Iniciar sesión
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@correo.com"
                    autoComplete="email"
                    required
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="password" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm tracking-wide">{error}</p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-zinc-900 text-white text-sm font-medium tracking-widest uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? 'Verificando...' : 'Entrar'}
                  </button>
                </div>

              </form>

              {/* Enlace a registro — mobile */}
              <p className="lg:hidden mt-8 text-sm text-gray-500 font-light">
                ¿No tienes cuenta?{' '}
                <Link to="/registro" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-gray-600 transition-colors">
                  Regístrate
                </Link>
              </p>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
