const STATUS_STYLES = {
  pendiente:  'bg-amber-50 text-amber-700 border border-amber-200',
  confirmada: 'bg-green-50 text-green-700 border border-green-200',
  cancelada:  'bg-red-50 text-red-600 border border-red-200',
  completada: 'bg-gray-100 text-gray-600 border border-gray-200',
  no_asistio: 'bg-orange-50 text-orange-600 border border-orange-200',
}

const ROLE_STYLES = {
  admin:    'bg-zinc-900 text-white',
  vendedor: 'bg-blue-50 text-blue-700 border border-blue-200',
  cliente:  'bg-gray-100 text-gray-600 border border-gray-200',
}

const VEHICLE_STYLES = {
  disponible: 'bg-green-50 text-green-700 border border-green-200',
  reservado:  'bg-amber-50 text-amber-700 border border-amber-200',
  vendido:    'bg-gray-100 text-gray-600 border border-gray-200',
  inactivo:   'bg-red-50 text-red-600 border border-red-200',
}

const LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
  no_asistio: 'No asistió',
  admin: 'Admin',
  vendedor: 'Vendedor',
  cliente: 'Cliente',
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
  inactivo: 'Inactivo',
}

export default function StatusBadge({ value, type = 'status' }) {
  const styles = type === 'role'
    ? ROLE_STYLES
    : type === 'vehicle'
      ? VEHICLE_STYLES
      : STATUS_STYLES

  const cls = styles[value] || 'bg-gray-100 text-gray-600 border border-gray-200'

  return (
    <span className={`inline-block text-[10px] uppercase tracking-widest font-medium px-3 py-1 rounded-none ${cls}`}>
      {LABELS[value] || value}
    </span>
  )
}
