import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import ClienteLayout from '../layouts/ClienteLayout'
import ClienteDashboard from '../pages/cliente/Dashboard'
import MisCitas from '../pages/cliente/MisCitas'
import MisCitasServicio from '../pages/cliente/MisCitasServicio'
import MiPerfil from '../pages/cliente/MiPerfil'

const ClienteRoute = ({ children }) => (
  <PrivateRoute>
    <ClienteLayout>{children}</ClienteLayout>
  </PrivateRoute>
)

const clienteRoutes = [
  <Route key="cliente" path="/cliente" element={<ClienteRoute><ClienteDashboard /></ClienteRoute>} />,
  <Route key="cliente-citas" path="/cliente/citas" element={<ClienteRoute><MisCitas /></ClienteRoute>} />,
  <Route key="cliente-citas-servicio" path="/cliente/mis-citas-servicio" element={<ClienteRoute><MisCitasServicio /></ClienteRoute>} />,
  <Route key="cliente-perfil" path="/cliente/perfil" element={<ClienteRoute><MiPerfil /></ClienteRoute>} />,
]

export default clienteRoutes
