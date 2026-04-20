import { Route } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import EncargadoLayout from '../layouts/EncargadoLayout'
import ServicioDashboard from '../pages/servicio/ServicioDashboard'
import ServicioModuloBahia from '../pages/servicio/ServicioModuloBahia'

const EncargadoRoute = ({ children }) => (
  <PrivateRoute>
    <EncargadoLayout>{children}</EncargadoLayout>
  </PrivateRoute>
)

const encargadoRoutes = [
  <Route key="encargado" path="/encargado" element={<EncargadoRoute><ServicioDashboard /></EncargadoRoute>} />,
  <Route key="encargado-bahia" path="/encargado/bahia/:bahia" element={<EncargadoRoute><ServicioModuloBahia /></EncargadoRoute>} />,
]

export default encargadoRoutes
