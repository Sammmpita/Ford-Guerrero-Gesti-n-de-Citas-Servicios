import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import VendedorLayout from '../layouts/VendedorLayout'
import VendedorDashboard from '../pages/vendedor/Dashboard'
import MisCitas from '../pages/vendedor/MisCitas'
import MiDisponibilidad from '../pages/vendedor/MiDisponibilidad'
import MiPerfil from '../pages/vendedor/MiPerfil'

const VendedorRoute = ({ children }) => (
  <PrivateRoute>
    <VendedorLayout>{children}</VendedorLayout>
  </PrivateRoute>
)

const vendedorRoutes = [
  <Route key="vendedor" path="/vendedor" element={<VendedorRoute><VendedorDashboard /></VendedorRoute>} />,
  <Route key="vendedor-citas" path="/vendedor/citas" element={<VendedorRoute><MisCitas /></VendedorRoute>} />,
  <Route key="vendedor-disponibilidad" path="/vendedor/disponibilidad" element={<VendedorRoute><MiDisponibilidad /></VendedorRoute>} />,
  <Route key="vendedor-perfil" path="/vendedor/perfil" element={<VendedorRoute><MiPerfil /></VendedorRoute>} />,
]

export default vendedorRoutes
