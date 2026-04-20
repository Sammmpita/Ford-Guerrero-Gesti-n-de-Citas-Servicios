import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../components/admin/StatusBadge'

const MOCK_KPIS = [
  { label: 'Citas Pendientes',   value: 14 },
  { label: 'Vehículos Activos',  value: 37 },
  { label: 'Vendedores Activos', value: 6 },
  { label: 'Citas Completadas',  value: 182 },
]

const MOCK_ACTIVIDAD = [
  {
    id: 'CIT-0048',
    fecha: '07/04/2026 10:00',
    cliente: 'María González',
    vehiculo: 'Ford Bronco Sport 2026',
    vendedor: 'Carlos Mendoza',
    estado: 'pendiente',
  },
  {
    id: 'CIT-0047',
    fecha: '07/04/2026 09:30',
    cliente: 'Roberto Sánchez',
    vehiculo: 'Ford Maverick 2026',
    vendedor: 'Ana Gutiérrez',
    estado: 'confirmada',
  },
  {
    id: 'CIT-0046',
    fecha: '06/04/2026 16:00',
    cliente: 'Laura Domínguez',
    vehiculo: 'Ford Explorer 2026',
    vendedor: 'Carlos Mendoza',
    estado: 'completada',
  },
  {
    id: 'CIT-0045',
    fecha: '06/04/2026 14:30',
    cliente: 'José Hernández',
    vehiculo: 'Ford Mustang Mach-E 2026',
    vendedor: 'Miguel Torres',
    estado: 'cancelada',
  },
  {
    id: 'CIT-0044',
    fecha: '06/04/2026 11:00',
    cliente: 'Patricia Flores',
    vehiculo: 'Ford Ranger 2026',
    vendedor: 'Ana Gutiérrez',
    estado: 'completada',
  },
  {
    id: 'CIT-0043',
    fecha: '05/04/2026 15:00',
    cliente: 'Fernando López',
    vehiculo: 'Ford Territory 2026',
    vendedor: 'Carlos Mendoza',
    estado: 'confirmada',
  },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-black text-4xl tracking-tight leading-none text-gray-900">
            Dashboard.
          </h1>
          <p className="mt-2 font-light tracking-wide text-gray-500 text-sm">
            Métricas en tiempo real de la agencia.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-medium border border-gray-300 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Menú principal
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_KPIS.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_40px_rgb(0,0,0,0.08)]"
          >
            <p className="font-black text-5xl font-mono tracking-tighter text-gray-900">
              {value}
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Actividad Reciente */}
      <div>
        <h2 className="font-extrabold text-xl tracking-tight text-gray-900 mb-1">
          Actividad Reciente
        </h2>
        <p className="text-sm font-light text-gray-500 tracking-wide mb-6">
          Últimas citas registradas en el sistema.
        </p>

        <div className="bg-white border border-gray-200">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Fecha / Hora</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Cliente</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Vehículo</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Vendedor</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ACTIVIDAD.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900 tracking-wide">{row.id}</td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-500 tracking-wide uppercase">{row.fecha}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.cliente}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-light">{row.vehiculo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.vendedor}</td>
                  <td className="px-6 py-4">
                    <StatusBadge value={row.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
