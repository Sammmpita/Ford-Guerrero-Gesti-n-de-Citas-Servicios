import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const Field = ({ label, value, readOnly, onChange, type = 'text' }) => (
  <div className="flex flex-col">
    <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`border-b py-3 px-0 text-sm bg-transparent focus:ring-0 focus:outline-none rounded-none transition-colors ${
        readOnly
          ? 'border-gray-100 text-gray-400 cursor-default'
          : 'border-gray-200 focus:border-zinc-900 text-gray-900'
      }`}
    />
  </div>
)

export default function MiPerfil() {
  const { user, getToken } = useAuth()
  const pc = user?.perfil_cliente

  const [personal, setPersonal] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telefono: user?.telefono || '',
  })
  const [contacto, setContacto] = useState({
    direccion: pc?.direccion || '',
    ciudad: pc?.ciudad || '',
  })
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingContacto, setSavingContacto] = useState(false)
  const [msgPersonal, setMsgPersonal] = useState('')
  const [msgContacto, setMsgContacto] = useState('')
  const [errorPersonal, setErrorPersonal] = useState('')
  const [errorContacto, setErrorContacto] = useState('')

  const handleGuardarPersonal = async (e) => {
    e.preventDefault()
    setSavingPersonal(true)
    setMsgPersonal('')
    setErrorPersonal('')
    try {
      const res = await fetch('/api/accounts/me/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(personal),
      })
      if (!res.ok) throw new Error('No se pudieron guardar los datos personales')
      setMsgPersonal('Datos personales actualizados.')
    } catch (e) {
      setErrorPersonal(e.message)
    } finally {
      setSavingPersonal(false)
    }
  }

  const handleGuardarContacto = async (e) => {
    e.preventDefault()
    setSavingContacto(true)
    setMsgContacto('')
    setErrorContacto('')
    try {
      const res = await fetch('/api/accounts/mi-perfil-cliente/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(contacto),
      })
      if (!res.ok) throw new Error('No se pudieron guardar los datos de contacto')
      setMsgContacto('Datos de contacto actualizados.')
    } catch (e) {
      setErrorContacto(e.message)
    } finally {
      setSavingContacto(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Cuenta</p>
        <h1 className="font-black text-3xl text-gray-900 tracking-tight">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Datos personales */}
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-6 border-b border-gray-100 pb-3">
            Datos personales
          </p>
          <form onSubmit={handleGuardarPersonal} className="flex flex-col gap-5">
            <Field label="Nombre" value={personal.first_name} onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })} />
            <Field label="Apellido" value={personal.last_name} onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })} />
            <Field label="Correo electrónico" value={user?.email || ''} readOnly />
            <Field label="Teléfono" value={personal.telefono} onChange={(e) => setPersonal({ ...personal, telefono: e.target.value })} />
            <Field label="Rol" value="Cliente" readOnly />

            {msgPersonal && <p className="text-xs text-green-600 tracking-wide">{msgPersonal}</p>}
            {errorPersonal && <p className="text-xs text-red-500 tracking-wide">{errorPersonal}</p>}

            <button
              type="submit"
              disabled={savingPersonal}
              className="mt-2 px-4 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 rounded-none"
            >
              {savingPersonal ? 'Guardando...' : 'Guardar datos personales'}
            </button>
          </form>
        </div>

        {/* Datos de contacto */}
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-6 border-b border-gray-100 pb-3">
            Datos de contacto
          </p>
          <form onSubmit={handleGuardarContacto} className="flex flex-col gap-5">
            <Field
              label="Dirección"
              value={contacto.direccion}
              onChange={(e) => setContacto({ ...contacto, direccion: e.target.value })}
            />
            <Field
              label="Ciudad"
              value={contacto.ciudad}
              onChange={(e) => setContacto({ ...contacto, ciudad: e.target.value })}
            />

            {msgContacto && <p className="text-xs text-green-600 tracking-wide">{msgContacto}</p>}
            {errorContacto && <p className="text-xs text-red-500 tracking-wide">{errorContacto}</p>}

            <button
              type="submit"
              disabled={savingContacto}
              className="mt-2 px-4 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 rounded-none"
            >
              {savingContacto ? 'Guardando...' : 'Guardar datos de contacto'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
