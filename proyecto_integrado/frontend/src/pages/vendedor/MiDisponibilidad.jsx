import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const HORAS = Array.from({ length: 13 }, (_, i) => i + 7) // 7:00 – 19:00

function formatH(h) {
  const suffix = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 || 12
  return `${h12}:00 ${suffix}`
}

// Convierte bloques API → Set de "dia-hora" activos
function bloquesToGrid(bloques) {
  const set = new Set()
  for (const b of bloques) {
    if (!b.activo) continue
    const hInicio = parseInt(b.hora_inicio.slice(0, 2), 10)
    const hFin = parseInt(b.hora_fin.slice(0, 2), 10)
    for (let h = hInicio; h < hFin; h++) {
      set.add(`${b.dia_semana}-${h}`)
    }
  }
  return set
}

// Convierte Set de "dia-hora" → array de bloques {dia_semana, hora_inicio, hora_fin}
function gridToBloques(selected) {
  const byDia = {}
  for (const key of selected) {
    const [d, h] = key.split('-').map(Number)
    if (!byDia[d]) byDia[d] = []
    byDia[d].push(h)
  }
  const result = []
  for (const [dia, horas] of Object.entries(byDia)) {
    horas.sort((a, b) => a - b)
    let start = horas[0]
    let prev = horas[0]
    for (let i = 1; i <= horas.length; i++) {
      if (i < horas.length && horas[i] === prev + 1) {
        prev = horas[i]
      } else {
        result.push({
          dia_semana: Number(dia),
          hora_inicio: `${String(start).padStart(2, '0')}:00`,
          hora_fin: `${String(prev + 1).padStart(2, '0')}:00`,
          activo: true,
        })
        if (i < horas.length) {
          start = horas[i]
          prev = horas[i]
        }
      }
    }
  }
  return result
}

export default function MiDisponibilidad() {
  const { getToken } = useAuth()
  const [bloques, setBloques] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dirty, setDirty] = useState(false)

  // Drag state
  const dragging = useRef(false)
  const dragMode = useRef('add') // 'add' | 'remove'
  const dragStart = useRef(null) // {dia, hora}
  const [dragPreview, setDragPreview] = useState(new Set())

  const cargar = useCallback(() => {
    fetch('/api/vendedores/disponibilidad/', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setBloques(data)
        setSelected(bloquesToGrid(data))
        setDirty(false)
      })
      .catch(() => setError('Error al cargar disponibilidad'))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => { cargar() }, [cargar])

  // Rect helper: genera todas las celdas entre esquinas opuestas del drag
  const getCellsInRect = (start, end) => {
    const minDia = Math.min(start.dia, end.dia)
    const maxDia = Math.max(start.dia, end.dia)
    const minHora = Math.min(start.hora, end.hora)
    const maxHora = Math.max(start.hora, end.hora)
    const cells = new Set()
    for (let d = minDia; d <= maxDia; d++) {
      for (let h = minHora; h <= maxHora; h++) {
        cells.add(`${d}-${h}`)
      }
    }
    return cells
  }

  const handleMouseDown = (dia, hora) => {
    dragging.current = true
    dragStart.current = { dia, hora }
    const key = `${dia}-${hora}`
    dragMode.current = selected.has(key) ? 'remove' : 'add'
    setDragPreview(new Set([key]))
  }

  const handleMouseEnter = (dia, hora) => {
    if (!dragging.current) return
    setDragPreview(getCellsInRect(dragStart.current, { dia, hora }))
  }

  const handleMouseUp = () => {
    if (!dragging.current) return
    dragging.current = false
    setSelected((prev) => {
      const next = new Set(prev)
      for (const key of dragPreview) {
        if (dragMode.current === 'add') next.add(key)
        else next.delete(key)
      }
      return next
    })
    setDirty(true)
    setSuccess('')
    setDragPreview(new Set())
  }

  // Global mouseup para capturar si sueltan fuera del grid
  useEffect(() => {
    const up = () => {
      if (dragging.current) handleMouseUp()
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  })

  const getCellState = (dia, hora) => {
    const key = `${dia}-${hora}`
    const inPreview = dragPreview.has(key)
    const isSelected = selected.has(key)

    if (inPreview) {
      return dragMode.current === 'add' ? 'preview-add' : 'preview-remove'
    }
    return isSelected ? 'active' : 'empty'
  }

  const cellClass = (state) => {
    switch (state) {
      case 'active':
        return 'bg-zinc-900 border-zinc-700'
      case 'preview-add':
        return 'bg-zinc-500 border-zinc-400'
      case 'preview-remove':
        return 'bg-red-200 border-red-300'
      default:
        return 'bg-gray-50 border-gray-100 hover:bg-gray-100'
    }
  }

  // Guardar: elimina todos los bloques existentes y crea los nuevos
  const handleGuardar = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const token = getToken()
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      // Eliminar bloques existentes
      await Promise.all(
        bloques.map((b) =>
          fetch(`/api/vendedores/disponibilidad/${b.id}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      )

      // Crear nuevos bloques desde el grid
      const nuevos = gridToBloques(selected)
      for (const bloque of nuevos) {
        const res = await fetch('/api/vendedores/disponibilidad/', {
          method: 'POST',
          headers,
          body: JSON.stringify(bloque),
        })
        if (!res.ok) {
          const data = await res.json()
          const key = Object.keys(data)[0]
          const msg = Array.isArray(data[key]) ? data[key][0] : data[key]
          throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        }
      }

      setSuccess('Disponibilidad guardada correctamente.')
      cargar()
    } catch (e) {
      setError(e.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  // Conteo de horas seleccionadas
  const totalHoras = selected.size

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">Horarios</p>
          <h1 className="font-black text-3xl text-gray-900 tracking-tight">Mi Disponibilidad</h1>
          <p className="text-sm text-gray-400 font-light mt-1">
            Haz click o arrastra para seleccionar tus horarios disponibles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs text-amber-600 font-medium tracking-wide">Cambios sin guardar</span>
          )}
          <button
            onClick={handleGuardar}
            disabled={saving || !dirty}
            className="px-6 py-3 bg-zinc-900 text-white text-xs font-medium tracking-widest uppercase hover:bg-zinc-800 transition-colors rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500 tracking-wide">{error}</p>}
      {success && <p className="mb-4 text-sm text-green-600 tracking-wide">{success}</p>}

      {loading ? (
        <div className="grid grid-cols-8 gap-px bg-gray-200 p-px">
          {Array.from({ length: 8 * 13 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Leyenda */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-900 border border-zinc-700" />
              <span className="text-xs text-gray-500">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200" />
              <span className="text-xs text-gray-500">No disponible</span>
            </div>
            <div className="ml-auto text-xs text-gray-400 tabular-nums">
              {totalHoras} {totalHoras === 1 ? 'hora' : 'horas'} seleccionadas
            </div>
          </div>

          {/* Grid semanal */}
          <div
            className="select-none overflow-x-auto"
            onMouseLeave={() => { if (dragging.current) handleMouseUp() }}
          >
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-16 p-2 text-right text-[10px] uppercase tracking-widest text-gray-300 font-medium" />
                  {DIAS.map((dia, i) => (
                    <th
                      key={i}
                      className="p-2 text-center text-[10px] uppercase tracking-widest text-gray-500 font-medium"
                    >
                      <span className="hidden sm:inline">{DIAS_FULL[i]}</span>
                      <span className="sm:hidden">{dia}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORAS.map((hora) => (
                  <tr key={hora}>
                    <td className="p-1 text-right text-[10px] text-gray-400 font-mono tabular-nums whitespace-nowrap select-none">
                      {formatH(hora)}
                    </td>
                    {DIAS.map((_, dia) => {
                      const state = getCellState(dia, hora)
                      return (
                        <td key={dia} className="p-px">
                          <div
                            onMouseDown={(e) => { e.preventDefault(); handleMouseDown(dia, hora) }}
                            onMouseEnter={() => handleMouseEnter(dia, hora)}
                            className={`h-8 border cursor-pointer transition-colors duration-100 ${cellClass(state)}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de bloques */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-3">
              Bloques resultantes
            </p>
            {gridToBloques(selected).length === 0 ? (
              <p className="text-sm text-gray-300 font-light">Ningún horario seleccionado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {gridToBloques(selected).map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-mono tabular-nums"
                  >
                    <span className="font-medium text-zinc-900">{DIAS_FULL[b.dia_semana]}</span>
                    {b.hora_inicio} – {b.hora_fin}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
