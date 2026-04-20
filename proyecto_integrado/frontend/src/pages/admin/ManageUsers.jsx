import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'
import SlideOver from '../../components/admin/SlideOver'

const FORM_INIT = {
  first_name: '',
  last_name: '',
  email: '',
  telefono: '',
  password: '',
  numero_empleado: '',
  especialidad: '',
  fecha_ingreso: new Date().toISOString().slice(0, 10),
}

const FORM_ENCARGADO_INIT = {
  first_name: '',
  last_name: '',
  email: '',
  telefono: '',
  password: '',
}

export default function ManageUsers() {
  const { getToken } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [slideOpen, setSlideOpen] = useState(false)
  const [slideEncargadoOpen, setSlideEncargadoOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [form, setForm] = useState(FORM_INIT)
  const [formEncargado, setFormEncargado] = useState(FORM_ENCARGADO_INIT)
  const [saving, setSaving] = useState(false)
  const [savingEncargado, setSavingEncargado] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [formEncargadoError, setFormEncargadoError] = useState('')

  const cargar = useCallback(() => {
    setLoading(true)
    fetch('/api/accounts/users/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then(setUsuarios)
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleChangeEncargado = (e) => setFormEncargado({ ...formEncargado, [e.target.name]: e.target.value })

  const handleSubmitEncargado = async (e) => {
    e.preventDefault()
    setSavingEncargado(true)
    setFormEncargadoError('')
    try {
      const res = await fetch('/api/accounts/crear-encargado/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formEncargado),
      })
      let data = null
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        data = await res.json()
      }
      if (!res.ok) {
        if (data) {
          const key = Object.keys(data)[0]
          const msg = Array.isArray(data[key]) ? data[key][0] : data[key]
          throw new Error(typeof msg === 'string' ? msg : 'Error al crear el encargado.')
        }
        throw new Error('No se pudo crear el encargado. Intenta de nuevo.')
      }
      cargar()
      setSlideEncargadoOpen(false)
      setFormEncargado(FORM_ENCARGADO_INIT)
    } catch (e) {
      setFormEncargadoError(e.message)
    } finally {
      setSavingEncargado(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch('/api/accounts/crear-vendedor/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        const key = Object.keys(data)[0]
        const msg = Array.isArray(data[key]) ? data[key][0] : data[key]
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      }
      cargar()
      setSlideOpen(false)
      setForm(FORM_INIT)
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (u) => {
    try {
      await fetch(`/api/accounts/users/${u.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ is_active: !u.is_active }),
      })
      cargar()
    } catch {
      setError('No se pudo cambiar el estado del usuario')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">
            Personal y Clientes
          </h1>
          <p className="mt-2 font-light tracking-wide text-gray-500 text-sm">
            Gestión de usuarios — crear vendedores, encargados de taller y desactivar cuentas.
          </p>
        </div>

        {/* Dropdown Crear */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Crear personal
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 shadow-lg z-20">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setDropdownOpen(false); setSlideOpen(true); setFormError('') }}
                className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <p className="font-medium">Crear Vendedor</p>
                <p className="text-xs text-gray-400 font-light mt-0.5">Asesor de ventas</p>
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setDropdownOpen(false); setSlideEncargadoOpen(true); setFormEncargadoError('') }}
                className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Crear Encargado</p>
                <p className="text-xs text-gray-400 font-light mt-0.5">Encargado de taller</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 tracking-wide">{error}</p>}

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400 font-light">Cargando...</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Nombre</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Email</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Teléfono</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Rol</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Estado</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600 tracking-wide">{u.email}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{u.telefono || '—'}</td>
                  <td className="px-6 py-4">
                    <StatusBadge value={u.rol} type="role" />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs uppercase tracking-widest text-gray-500 font-medium">
                      {u.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleActivo(u)}
                      className={`text-[10px] uppercase tracking-widest font-medium transition-colors duration-200 ${
                        u.is_active
                          ? 'text-gray-400 hover:text-red-600'
                          : 'text-gray-400 hover:text-green-600'
                      }`}
                    >
                      {u.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over: Crear Encargado de Taller */}
      <SlideOver open={slideEncargadoOpen} onClose={() => setSlideEncargadoOpen(false)} title="Crear Encargado de Taller">
        <form onSubmit={handleSubmitEncargado} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Nombre</label>
              <input
                name="first_name"
                value={formEncargado.first_name}
                onChange={handleChangeEncargado}
                required
                placeholder="Nombre"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Apellidos</label>
              <input
                name="last_name"
                value={formEncargado.last_name}
                onChange={handleChangeEncargado}
                required
                placeholder="Apellidos"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Email</label>
            <input
              name="email"
              type="email"
              value={formEncargado.email}
              onChange={handleChangeEncargado}
              required
              placeholder="encargado@fordacapulco.mx"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Teléfono</label>
            <input
              name="telefono"
              value={formEncargado.telefono}
              onChange={handleChangeEncargado}
              placeholder="744 200 0000"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Contraseña inicial</label>
            <input
              name="password"
              type="password"
              value={formEncargado.password}
              onChange={handleChangeEncargado}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          {formEncargadoError && (
            <p className="text-sm text-red-500 tracking-wide">{formEncargadoError}</p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={savingEncargado}
              className="flex-1 px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:translate-y-0"
            >
              {savingEncargado ? 'Creando...' : 'Crear Encargado'}
            </button>
            <button
              type="button"
              onClick={() => setSlideEncargadoOpen(false)}
              className="px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none focus:outline-none"
            >
              Cancelar
            </button>
          </div>
        </form>
      </SlideOver>

      {/* Slide-over: Crear Vendedor */}
      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title="Crear Vendedor">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
                Nombre
              </label>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                placeholder="Nombre"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
                Apellidos
              </label>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                placeholder="Apellidos"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="vendedor@fordacapulco.mx"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Teléfono
            </label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              placeholder="744 200 0000"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Contraseña inicial
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Número de Empleado
            </label>
            <input
              name="numero_empleado"
              value={form.numero_empleado}
              onChange={handleChange}
              required
              placeholder="EMP-0012"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 font-mono placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Especialidad
            </label>
            <input
              name="especialidad"
              value={form.especialidad}
              onChange={handleChange}
              placeholder="SUVs, Pickups, Vehículos eléctricos"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">
              Fecha de ingreso
            </label>
            <input
              name="fecha_ingreso"
              type="date"
              value={form.fecha_ingreso}
              onChange={handleChange}
              required
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-500 tracking-wide">{formError}</p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:translate-y-0"
            >
              {saving ? 'Creando...' : 'Crear Vendedor'}
            </button>
            <button
              type="button"
              onClick={() => setSlideOpen(false)}
              className="px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
