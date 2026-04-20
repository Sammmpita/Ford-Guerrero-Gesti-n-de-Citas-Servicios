import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telefono: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
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
                Empieza tu<br />experiencia Ford.
              </h1>
              <p className="text-gray-400 font-light leading-relaxed max-w-xs text-sm">
                Crea tu cuenta en segundos y agenda pruebas de manejo, citas de compra, financiamiento y más.
              </p>

              <div className="mt-12 flex flex-col gap-4">
                {['Agenda citas desde tu perfil', 'Seguimiento de tu solicitud', 'Ofertas exclusivas para clientes'].map((item) => (
                  <div key={item} className="flex items-center gap-4 border-t border-zinc-800 pt-4">
                    <span className="text-sm text-gray-300 font-light">{item}</span>
                    <span className="ml-auto text-blue-500 text-xs" aria-hidden="true">●</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-8">
              <p className="text-gray-500 font-light text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link
                  to="/login"
                  className="text-white font-medium underline underline-offset-4 hover:text-gray-300 transition-colors"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div className="flex flex-col justify-center px-8 md:px-16 py-20">
            <div className="w-full max-w-sm mx-auto">

              <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
                Nueva cuenta
              </p>
              <h2 className="font-black text-3xl text-gray-900 tracking-tight leading-none mb-10">
                Regístrate
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label htmlFor="first_name" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                      Nombre(s) *
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="Juan"
                      autoComplete="given-name"
                      required
                      className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="last_name" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                      Apellido *
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="García"
                      autoComplete="family-name"
                      required
                      className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Correo electrónico *
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
                  <label htmlFor="telefono" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="744 000 0000"
                    autoComplete="tel"
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 font-mono placeholder:text-gray-400 placeholder:font-light transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="reg_password" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Contraseña *
                  </label>
                  <input
                    id="reg_password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    required
                    className="border-0 border-b border-gray-300 focus:border-zinc-900 focus:ring-0 focus:outline-none rounded-none bg-transparent px-0 py-3 w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light transition-colors"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="password2" className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1">
                    Confirmar contraseña *
                  </label>
                  <input
                    id="password2"
                    type="password"
                    name="password2"
                    value={form.password2}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
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
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                  <p className="mt-3 text-xs text-gray-400 text-center font-light">
                    Al registrarte aceptas nuestro{' '}
                    <a href="#" className="underline hover:text-gray-600 transition-colors">aviso de privacidad</a>
                  </p>
                </div>

              </form>

              {/* Enlace a login — mobile */}
              <p className="lg:hidden mt-8 text-sm text-gray-500 font-light">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-zinc-900 font-medium underline underline-offset-4 hover:text-gray-600 transition-colors">
                  Inicia sesión
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
