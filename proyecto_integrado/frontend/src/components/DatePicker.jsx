import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // lunes = 0
}

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

export default function DatePicker({ value, onChange, min, label, id, required }) {
  const parsed = parseDate(value)
  const today = new Date()
  const minDate = min ? parseDate(min) : null

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(parsed?.year || today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth())
  const ref = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  const isDisabled = (day) => {
    if (!minDate) return false
    const d = new Date(viewYear, viewMonth, day)
    const m = new Date(minDate.year, minDate.month, minDate.day)
    return d < m
  }

  const isToday = (day) =>
    viewYear === today.getFullYear() &&
    viewMonth === today.getMonth() &&
    day === today.getDate()

  const isSelected = (day) =>
    parsed &&
    viewYear === parsed.year &&
    viewMonth === parsed.month &&
    day === parsed.day

  const selectDay = (day) => {
    if (isDisabled(day)) return
    onChange(formatDate(viewYear, viewMonth, day))
    setOpen(false)
  }

  const displayValue = parsed
    ? `${parsed.day} de ${MONTHS[parsed.month].toLowerCase()} ${parsed.year}`
    : ''

  return (
    <div className="relative" ref={ref}>
      {/* Input visual */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border-0 border-b px-0 py-3 text-left transition-colors
          ${open ? 'border-[#003478]' : 'border-gray-300'}
          bg-transparent focus:outline-none group`}
      >
        <span className={`text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {displayValue || 'Seleccionar fecha...'}
        </span>
        <Calendar
          size={18}
          className={`transition-colors ${open ? 'text-[#003478]' : 'text-gray-400 group-hover:text-gray-600'}`}
        />
      </button>

      {/* Dropdown calendario */}
      {open && (
        <div className="absolute z-50 mt-2 w-[300px] bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
          {/* Header con navegación de mes */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] uppercase tracking-widest text-gray-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const disabled = isDisabled(day)
              const selected = isSelected(day)
              const todayStyle = isToday(day)

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  disabled={disabled}
                  className={`
                    h-9 w-full rounded-lg text-sm font-medium transition-all duration-150
                    ${disabled
                      ? 'text-gray-200 cursor-not-allowed'
                      : selected
                        ? 'bg-[#003478] text-white shadow-sm shadow-blue-900/20'
                        : todayStyle
                          ? 'bg-blue-50 text-[#003478] font-bold hover:bg-[#003478] hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer del calendario */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors tracking-wide"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => {
                const t = new Date()
                setViewYear(t.getFullYear())
                setViewMonth(t.getMonth())
                selectDay(t.getDate())
              }}
              className="text-xs text-[#003478] font-medium hover:text-blue-700 transition-colors tracking-wide"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
