import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import ManageVehicles from '../pages/admin/ManageVehicles'
import ManageAppointments from '../pages/admin/ManageAppointments'
import ManageUsers from '../pages/admin/ManageUsers'
import ServicioDashboard from '../pages/servicio/ServicioDashboard'
import ServicioModuloBahia from '../pages/servicio/ServicioModuloBahia'

const AdminRoute = ({ children }) => (
  <PrivateRoute>
    <AdminLayout>{children}</AdminLayout>
  </PrivateRoute>
)

const adminRoutes = [
  <Route key="admin" path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />,
  <Route key="admin-vehiculos" path="/admin/vehiculos" element={<AdminRoute><ManageVehicles /></AdminRoute>} />,
  <Route key="admin-citas" path="/admin/citas" element={<AdminRoute><ManageAppointments /></AdminRoute>} />,
  <Route key="admin-usuarios" path="/admin/usuarios" element={<AdminRoute><ManageUsers /></AdminRoute>} />,
  <Route key="servicio-dashboard" path="/servicio/dashboard" element={<AdminRoute><ServicioDashboard /></AdminRoute>} />,
  <Route key="servicio-bahia" path="/servicio/dashboard/bahia/:bahia" element={<AdminRoute><ServicioModuloBahia /></AdminRoute>} />,
]

export default adminRoutes
