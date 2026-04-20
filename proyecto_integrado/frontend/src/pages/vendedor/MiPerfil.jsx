import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const Field = ({ label, value, readOnly, onChange, type = 'text', as }) => (
  <div className="flex flex-col">
    <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">{label}</label>
    {as === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        rows={4}
        className={`border-b py-2 px-0 text-sm bg-transparent focus:ring-0 focus:outline-none rounded-none resize-none transition-colors ${
          readOnly
            ? 'border-gray-100 text-gray-400 cursor-default'
            : 'border-gray-200 focus:border-zinc-900 text-gray-900'
        }`}
      />
    ) : (
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
    )}
  </div>
)

export default function MiPerfil() {
  const { user, getToken } = useAuth()
  const vp = user?.vendedor_perfil

  const [personal, setPersonal] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    telefono: user?.telefono || '',
  })
  const [profesional, setProfesional] = useState({
    especialidad: vp?.especialidad || '',
    biografia: vp?.biografia || '',
  })
  const [fotoFile, setFotoFile] = useState(null)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [savingProfesional, setSavingProfesional] = useState(false)
  const [msgPersonal, setMsgPersonal] = useState('')
  const [msgProfesional, setMsgProfesional] = useState('')
  const [errorPersonal, setErrorPersonal] = useState('')
  const [errorProfesional, setErrorProfesional] = useState('')

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

  const handleGuardarProfesional = async (e) => {
    e.preventDefault()
    setSavingProfesional(true)
    setMsgProfesional('')
    setErrorProfesional('')
    try {
      const formData = new FormData()
      formData.append('especialidad', profesional.especialidad)
      formData.append('biografia', profesional.biografia)
      if (fotoFile) formData.append('foto', fotoFile)

      const res = await fetch('/api/vendedores/mi-perfil/', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      if (!res.ok) throw new Error('No se pudieron guardar los datos profesionales')
      setMsgProfesional('Perfil profesional actualizado.')
      setFotoFile(null)
    } catch (e) {
      setErrorProfesional(e.message)
    } finally {
      setSavingProfesional(false)
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
            <Field label="Rol" value="Vendedor / Asesor" readOnly />

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

        {/* Perfil profesional */}
        <div className="bg-white border border-gray-100 p-6">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-6 border-b border-gray-100 pb-3">
            Perfil profesional
          </p>
          <form onSubmit={handleGuardarProfesional} className="flex flex-col gap-5">
            <Field label="Número de empleado" value={vp?.numero_empleado || '—'} readOnly />
            <Field label="Fecha de ingreso" value={vp?.fecha_ingreso || '—'} readOnly />
            <Field
              label="Especialidad"
              value={profesional.especialidad}
              onChange={(e) => setProfesional({ ...profesional, especialidad: e.target.value })}
            />
            <Field
              label="Biografía"
              value={profesional.biografia}
              onChange={(e) => setProfesional({ ...profesional, biografia: e.target.value })}
              as="textarea"
            />

            {/* Foto */}
            <div className="flex flex-col">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
                Foto de perfil
              </label>
              {vp?.foto && !fotoFile && (
                <img
                  src={vp.foto}
                  alt="Foto de perfil"
                  className="w-16 h-16 object-cover mb-2 border border-gray-100"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoFile(e.target.files[0] || null)}
                className="text-sm text-gray-400 file:mr-4 file:py-1 file:px-3 file:border file:border-gray-200 file:text-xs file:bg-white file:text-gray-700 hover:file:border-gray-400 transition-all"
              />
            </div>

            {msgProfesional && <p className="text-xs text-green-600 tracking-wide">{msgProfesional}</p>}
            {errorProfesional && <p className="text-xs text-red-500 tracking-wide">{errorProfesional}</p>}

            <button
              type="submit"
              disabled={savingProfesional}
              className="mt-2 px-4 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 rounded-none"
            >
              {savingProfesional ? 'Guardando...' : 'Guardar perfil profesional'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
