import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'

const SERVICIOS_LABEL = {
  Preventivo: 'Mantenimiento Preventivo',
  Frenos: 'Sistema de Frenos',
  Suspension: 'Suspensión',
  Electrico: 'Sistema Eléctrico',
  Otro: 'Otro',
}

const ESTATUS_STYLES = {
  Pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  'En Proceso': 'bg-blue-50 text-blue-700 border border-blue-200',
  Terminado: 'bg-green-50 text-green-700 border border-green-200',
  Cancelado: 'bg-red-50 text-red-600 border border-red-200',
}

function EstatusBadge({ value }) {
  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-none ${ESTATUS_STYLES[value] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {value}
    </span>
  )
}

const formatFecha = (fecha, hora) => {
  if (!fecha) return '—'
  const d = new Date(fecha + 'T00:00:00')
  const fechaStr = d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  if (!hora) return fechaStr
  const [hh] = hora.split(':').map(Number)
  const suffix = hh < 12 ? 'AM' : 'PM'
  const h12 = hh % 12 || 12
  return `${fechaStr} — ${h12}:00 ${suffix}`
}

// Modal para cancelar cita
function CancelarModal({ cita, onClose, onConfirm, loading }) {
  const [motivo, setMotivo] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-gray-200 p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-black text-xl text-gray-900 tracking-tight mb-2">
          Cancelar cita #{String(cita.id).padStart(4, '0')}
        </h3>
        <p className="text-sm text-gray-500 font-light mb-6">
          {cita.modelo_auto} — {cita.placas}
        </p>
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
            Motivo <span className="normal-case text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="¿Por qué cancelas la cita?"
            className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 resize-none font-light"
          />
        </div>
        <div className="flex gap-3">
          <button
            disabled={loading}
            onClick={() => onConfirm(motivo)}
            className="flex-1 py-3 bg-red-600 text-white text-xs font-medium tracking-widest uppercase hover:bg-red-700 transition-colors rounded-none disabled:opacity-50"
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase hover:border-gray-900 hover:text-gray-900 transition-colors rounded-none"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal para comentar cita terminada
function ComentarModal({ cita, onClose, onConfirm, loading }) {
  const [comentario, setComentario] = useState(cita.comentario_cliente || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white border border-gray-200 p-8 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="font-black text-xl text-gray-900 tracking-tight mb-2">
          Dejar comentario
        </h3>
        <p className="text-sm text-gray-500 font-light mb-6">
          {cita.modelo_auto} — {cita.placas}
        </p>
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
            Tu experiencia
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
            placeholder="¿Cómo fue tu experiencia con el servicio?"
            className="w-full border border-gray-200 rounded-none px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-light focus:border-zinc-900 focus:ring-0 resize-none font-light"
          />
        </div>
        <div className="flex gap-3">
          <button
            disabled={loading || !comentario.trim()}
            onClick={() => onConfirm(comentario)}
            className="flex-1 py-3 bg-[#003478] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#002560] transition-colors rounded-none disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar comentario'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-600 text-xs font-medium tracking-widest uppercase hover:border-gray-900 hover:text-gray-900 transition-colors rounded-none"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ServicioMisCitas() {
  const { user, getToken } = useAuth()
  const navigate = useNavigate()

  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [modalCancelar, setModalCancelar] = useState(null)
  const [modalComentar, setModalComentar] = useState(null)
  const [accionLoading, setAccionLoading] = useState(false)

  const cargar = useCallback(() => {
    if (!user) return
    setLoading(true)
    fetch('/api/servicio/citas/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar citas')
        return r.json()
      })
      .then((data) => setCitas(Array.isArray(data) ? data : data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [user, getToken])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleCancelar = async (motivo) => {
    setAccionLoading(true)
    setMsg('')
    setError('')
    try {
      const res = await fetch(`/api/servicio/citas/${modalCancelar.id}/cancelar/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ motivo }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'No se pudo cancelar la cita.')
      }
      setMsg('Cita cancelada correctamente.')
      setModalCancelar(null)
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setAccionLoading(false)
    }
  }

  const handleComentar = async (comentario) => {
    setAccionLoading(true)
    setMsg('')
    setError('')
    try {
      const res = await fetch(`/api/servicio/citas/${modalComentar.id}/comentar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ comentario }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'No se pudo enviar el comentario.')
      }
      setMsg('Comentario enviado correctamente. ¡Gracias por tu opinión!')
      setModalComentar(null)
      cargar()
    } catch (e) {
      setError(e.message)
    } finally {
      setAccionLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="font-black text-2xl text-gray-900 mb-2">Inicia sesión para ver tus citas</p>
            <Link to="/login" className="text-sm text-[#003478] underline">Ir al login</Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#00274C] via-[#003478] to-[#1c3f94] py-16">
        <div className="max-w-7xl mx-auto px-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="uppercase text-xs tracking-widest text-gray-400 font-medium mb-3">
              Taller de Servicio
            </p>
            <h1 className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none">
              Mis Citas de Servicio<span className="text-blue-500">.</span>
            </h1>
          </div>
          <Link
            to="/servicio/agendar"
            className="px-6 py-3 bg-blue-700 text-white text-xs font-medium tracking-widest uppercase hover:bg-blue-600 transition-colors rounded-none"
          >
            + Nueva cita
          </Link>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-12 bg-gray-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6">

          {msg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-700 font-light">{msg}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-light">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-100 p-10 text-center">
              <p className="text-sm text-gray-400 font-light">Cargando tus citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 p-16 text-center">
              <p className="font-black text-xl text-gray-900 tracking-tight mb-2">Sin citas de servicio</p>
              <p className="text-sm text-gray-500 font-light mb-8">
                Aún no tienes ninguna cita registrada en el taller.
              </p>
              <Link
                to="/servicio/agendar"
                className="inline-block px-8 py-3.5 bg-[#003478] text-white text-xs font-medium tracking-widest uppercase hover:bg-[#002560] transition-colors rounded-none"
              >
                Agendar mi primera cita
              </Link>
            </div>
          ) : (
            <>
              {/* Tabla desktop */}
              <div className="hidden md:block bg-white border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['#', 'Vehículo', 'Servicio', 'Fecha y hora', 'Bahía', 'Estatus', 'Acciones'].map((h) => (
                        <th key={h} className="px-6 py-3 text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {citas.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-400 tracking-wide">
                          {String(c.id).padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 font-medium">{c.modelo_auto}</p>
                          <p className="text-xs text-gray-400 font-mono tracking-widest">{c.placas}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-light">
                          {SERVICIOS_LABEL[c.servicio] || c.servicio}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-light whitespace-nowrap">
                          {formatFecha(c.fecha, c.hora)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-light">
                          {c.bahia_asignada || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <EstatusBadge value={c.estatus} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {(c.estatus === 'Pendiente' || c.estatus === 'En Proceso') && (
                              <button
                                onClick={() => setModalCancelar(c)}
                                className="px-3 py-1 text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 tracking-wide transition-all rounded-none"
                              >
                                Cancelar
                              </button>
                            )}
                            {c.estatus === 'Terminado' && !c.comentario_cliente && (
                              <button
                                onClick={() => setModalComentar(c)}
                                className="px-3 py-1 text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 tracking-wide transition-all rounded-none"
                              >
                                Comentar
                              </button>
                            )}
                            {c.estatus === 'Terminado' && c.comentario_cliente && (
                              <span className="text-xs text-gray-400 font-light italic">Comentario enviado</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <div className="md:hidden space-y-4">
                {citas.map((c) => (
                  <div key={c.id} className="bg-white border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{c.modelo_auto}</p>
                        <p className="text-xs text-gray-400 font-mono tracking-widest">{c.placas}</p>
                      </div>
                      <EstatusBadge value={c.estatus} />
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs text-gray-500 font-light">
                        <span className="font-medium">Servicio:</span> {SERVICIOS_LABEL[c.servicio] || c.servicio}
                      </p>
                      <p className="text-xs text-gray-500 font-light">
                        <span className="font-medium">Fecha:</span> {formatFecha(c.fecha, c.hora)}
                      </p>
                      {c.bahia_asignada && (
                        <p className="text-xs text-gray-500 font-light">
                          <span className="font-medium">Bahía:</span> {c.bahia_asignada}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(c.estatus === 'Pendiente' || c.estatus === 'En Proceso') && (
                        <button
                          onClick={() => setModalCancelar(c)}
                          className="px-4 py-2 text-xs font-medium border border-red-300 text-red-700 hover:bg-red-50 tracking-wide transition-all rounded-none"
                        >
                          Cancelar
                        </button>
                      )}
                      {c.estatus === 'Terminado' && !c.comentario_cliente && (
                        <button
                          onClick={() => setModalComentar(c)}
                          className="px-4 py-2 text-xs font-medium border border-blue-300 text-blue-700 hover:bg-blue-50 tracking-wide transition-all rounded-none"
                        >
                          Dejar comentario
                        </button>
                      )}
                    </div>
                    {c.notas_admin && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Nota del taller</p>
                        <p className="text-xs text-gray-600 font-light">{c.notas_admin}</p>
                      </div>
                    )}
                    {c.motivo_cancelacion && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">Motivo de cancelación</p>
                        <p className="text-xs text-gray-600 font-light">{c.motivo_cancelacion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Modales */}
      {modalCancelar && (
        <CancelarModal
          cita={modalCancelar}
          onClose={() => setModalCancelar(null)}
          onConfirm={handleCancelar}
          loading={accionLoading}
        />
      )}
      {modalComentar && (
        <ComentarModal
          cita={modalComentar}
          onClose={() => setModalComentar(null)}
          onConfirm={handleComentar}
          loading={accionLoading}
        />
      )}

      <Footer />
    </div>
  )
}
