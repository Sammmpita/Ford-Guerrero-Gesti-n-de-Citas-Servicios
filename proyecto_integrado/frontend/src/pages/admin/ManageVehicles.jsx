import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/admin/StatusBadge'
import SlideOver from '../../components/admin/SlideOver'

const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'reservado', label: 'Reservado' },
  { value: 'vendido', label: 'Vendido' },
  { value: 'inactivo', label: 'Inactivo' },
]

const FORM_INIT = {
  modelo: '', categoria: '', anio: new Date().getFullYear(), version: '',
  precio: '', color: '', kilometraje: 0, descripcion: '', estado: 'disponible',
}

const formatPrecio = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n)

export default function ManageVehicles() {
  const { getToken } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [slideOpen, setSlideOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_INIT)
  const [fotos, setFotos] = useState([])          // File objects nuevos
  const [fotosExistentes, setFotosExistentes] = useState([]) // imágenes ya en servidor
  const [principalIdx, setPrincipalIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [confirmar, setConfirmar] = useState(null) // { id, modelo }

  const cargar = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` }
      const [vRes, cRes] = await Promise.all([
        fetch('/api/autos/vehiculos/', { headers }),
        fetch('/api/autos/categorias/', { headers }),
      ])
      const vData = await vRes.json()
      const cData = await cRes.json()
      setVehiculos(Array.isArray(vData) ? vData : vData.results || [])
      setCategorias(Array.isArray(cData) ? cData : cData.results || [])
    } catch {
      setError('Error al cargar datos.')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => { cargar() }, [cargar])

  // helpers
  const imgPrincipal = (v) => {
    if (!v.imagenes || v.imagenes.length === 0) return null
    const p = v.imagenes.find((i) => i.es_principal) || v.imagenes[0]
    return p.imagen
  }

  const abrirCrear = () => {
    setEditando(null)
    setForm(FORM_INIT)
    setFotos([])
    setFotosExistentes([])
    setPrincipalIdx(0)
    setError('')
    setSlideOpen(true)
  }

  const abrirEditar = (v) => {
    setEditando(v)
    setForm({
      modelo: v.modelo,
      categoria: v.categoria?.id || '',
      anio: v.anio,
      version: v.version || '',
      precio: v.precio,
      color: v.color || '',
      kilometraje: v.kilometraje || 0,
      descripcion: v.descripcion || '',
      estado: v.estado,
    })
    setFotos([])
    setFotosExistentes(v.imagenes || [])
    const pIdx = (v.imagenes || []).findIndex((i) => i.es_principal)
    setPrincipalIdx(pIdx >= 0 ? pIdx : 0)
    setError('')
    setSlideOpen(true)
  }

  // Fotos handlers
  const agregarFotos = (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) return
    setFotos((prev) => [...prev, ...arr])
  }

  const quitarFotoNueva = (idx) => {
    setFotos((prev) => prev.filter((_, i) => i !== idx))
  }

  const eliminarFotoExistente = async (imgId) => {
    if (!editando) return
    try {
      await fetch(`/api/autos/vehiculos/${editando.id}/imagenes/${imgId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setFotosExistentes((prev) => prev.filter((i) => i.id !== imgId))
    } catch {
      setError('No se pudo eliminar la imagen.')
    }
  }

  // Drop zone
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    agregarFotos(e.dataTransfer.files)
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const token = getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

      // 1) Crear o actualizar vehículo
      const url = editando
        ? `/api/autos/vehiculos/${editando.id}/`
        : '/api/autos/vehiculos/'
      const method = editando ? 'PUT' : 'POST'

      const body = {
        ...form,
        categoria: Number(form.categoria) || null,
        anio: Number(form.anio),
        precio: Number(form.precio),
        kilometraje: Number(form.kilometraje) || 0,
      }

      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (!res.ok) {
        const data = await res.json()
        const key = Object.keys(data)[0]
        const msg = Array.isArray(data[key]) ? data[key][0] : data[key]
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
      }
      const vehiculo = await res.json()

      // 2) Subir fotos nuevas
      for (let i = 0; i < fotos.length; i++) {
        const fd = new FormData()
        fd.append('imagen', fotos[i])
        // La primera foto nueva es principal solo si no hay fotos existentes
        const esPrincipal = fotosExistentes.length === 0 && i === 0
        fd.append('es_principal', esPrincipal)
        fd.append('orden', fotosExistentes.length + i)

        const imgRes = await fetch(`/api/autos/vehiculos/${vehiculo.id}/imagenes/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (!imgRes.ok) {
          console.error('Error subiendo imagen', await imgRes.text())
        }
      }

      await cargar()
      setSlideOpen(false)
    } catch (err) {
      setError(err.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  // Eliminar vehículo
  const handleEliminar = async () => {
    if (!confirmar) return
    try {
      await fetch(`/api/autos/vehiculos/${confirmar.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      setConfirmar(null)
      cargar()
    } catch {
      setError('No se pudo eliminar.')
      setConfirmar(null)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Total fotos para preview slots
  const totalPreviews = [...fotosExistentes, ...fotos]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">
            Inventario
          </h1>
          <p className="mt-2 font-light tracking-wide text-gray-500 text-sm">
            {vehiculos.length} vehículo{vehiculos.length !== 1 && 's'} en catálogo.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
        >
          + Nuevo Vehículo
        </button>
      </div>

      {error && !slideOpen && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400 font-light">Cargando inventario...</div>
        ) : vehiculos.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400 font-light">Sin vehículos registrados.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium w-16" />
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Modelo</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Categoría</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Año</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Precio</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Estatus</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehiculos.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {imgPrincipal(v) ? (
                        <img src={imgPrincipal(v)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-gray-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {v.marca} {v.modelo}
                  </td>
                  <td className="px-6 py-4 text-xs uppercase tracking-widest text-gray-500 font-medium">
                    {v.categoria?.nombre || '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">{v.anio}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{formatPrecio(v.precio)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge value={v.estado} type="vehicle" />
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => abrirEditar(v)}
                      className="text-[10px] uppercase tracking-widest text-gray-400 font-medium hover:text-zinc-900 transition-colors duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmar({ id: v.id, modelo: `${v.marca} ${v.modelo}` })}
                      className="text-[10px] uppercase tracking-widest text-gray-400 font-medium hover:text-red-600 transition-colors duration-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal confirmación eliminar */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirmar(null)}
          />
          {/* Panel */}
          <div className="relative bg-white w-full max-w-sm mx-4 p-8 shadow-2xl">
            {/* Acento superior */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-900" />

            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-1">
              Confirmar eliminación
            </p>
            <h2 className="text-xl font-black tracking-tight text-gray-900 leading-tight">
              {confirmar.modelo}
            </h2>
            <p className="mt-3 text-sm font-light text-gray-500 leading-relaxed">
              Esta acción eliminará el vehículo del inventario de forma permanente.
              Las imágenes asociadas también serán borradas.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleEliminar}
                className="flex-1 py-3 bg-zinc-900 text-white text-xs font-medium uppercase tracking-widest hover:bg-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmar(null)}
                className="flex-1 py-3 border border-gray-300 text-xs font-medium uppercase tracking-widest text-gray-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors duration-200 focus:outline-none"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={editando ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Modelo */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Modelo</label>
            <input name="modelo" value={form.modelo} onChange={handleChange} required placeholder="Ej: Bronco Sport"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light" />
          </div>

          {/* Categoría */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Categoría</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} required
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900">
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Año + Color */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Año</label>
              <input name="anio" type="number" value={form.anio} onChange={handleChange} required
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Color</label>
              <input name="color" value={form.color} onChange={handleChange} placeholder="Ej: Shadow Black"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light" />
            </div>
          </div>

          {/* Versión */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Versión</label>
            <input name="version" value={form.version} onChange={handleChange} placeholder="Ej: Titanium, Raptor, XLT"
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light" />
          </div>

          {/* Precio + Kilometraje */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Precio (MXN)</label>
              <input name="precio" type="number" value={form.precio} onChange={handleChange} required placeholder="789900"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 font-mono placeholder:text-gray-400 placeholder:font-light" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Kilometraje</label>
              <input name="kilometraje" type="number" value={form.kilometraje} onChange={handleChange} placeholder="0"
                className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 font-mono placeholder:text-gray-400 placeholder:font-light" />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900">
              {ESTADOS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-1 block">Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Descripción del vehículo..."
              className="border-0 border-b border-gray-300 rounded-none px-0 py-3 focus:border-zinc-900 focus:ring-0 bg-transparent w-full text-gray-900 placeholder:text-gray-400 placeholder:font-light resize-none" />
          </div>

          {/* ── Zona de Fotos ── */}
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3 block">
              Fotografías
            </label>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-none p-6 text-center cursor-pointer transition-colors duration-200
                ${dragOver ? 'border-zinc-900 bg-zinc-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-300 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-xs text-gray-400 font-light">
                Arrastra fotos aquí o <span className="underline font-medium text-gray-600">click para seleccionar</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => agregarFotos(e.target.files)}
              />
            </div>

            {/* Thumbnails */}
            {totalPreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {/* Fotos existentes del servidor */}
                {fotosExistentes.map((img, i) => (
                  <div key={`ex-${img.id}`} className="relative group aspect-square bg-gray-100 overflow-hidden">
                    <img src={img.imagen} alt="" className="w-full h-full object-cover" />
                    {img.es_principal && (
                      <span className="absolute top-1 left-1 bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider font-bold">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminarFotoExistente(img.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Fotos nuevas (no subidas aún) */}
                {fotos.map((file, i) => (
                  <div key={`new-${i}`} className="relative group aspect-square bg-gray-100 overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    {fotosExistentes.length === 0 && i === 0 && (
                      <span className="absolute top-1 left-1 bg-zinc-900 text-white text-[8px] px-1.5 py-0.5 uppercase tracking-wider font-bold">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => quitarFotoNueva(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && slideOpen && <p className="text-sm text-red-500">{error}</p>}

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving}
              className="flex-1 px-6 py-3 bg-zinc-900 text-white text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-zinc-800 rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50">
              {saving ? 'Guardando...' : editando ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
            </button>
            <button type="button" onClick={() => setSlideOpen(false)}
              className="px-6 py-3 border border-zinc-900 text-zinc-900 text-sm font-medium tracking-wide uppercase transition-all duration-300 ease-out hover:bg-zinc-900 hover:text-white rounded-none focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:ring-offset-2">
              Cancelar
            </button>
          </div>
        </form>
      </SlideOver>
    </div>
  )
}
