import { Route, Navigate } from 'react-router-dom'
import PrivateRoute from '../components/PrivateRoute'
import Home from '../pages/public/Home'
import Catalogo from '../pages/public/Catalogo'
import Contact from '../pages/public/Contact'
import Financing from '../pages/public/Financing'
import TestDrive from '../pages/public/TestDrive'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import Citas from '../pages/public/Citas'
import Seminuevos from '../pages/public/Seminuevos'
import ServicioHome from '../pages/servicio/ServicioHome'
import ServicioAgendar from '../pages/servicio/ServicioAgendar'

const publicRoutes = [
  <Route key="home" path="/" element={<Home />} />,
  <Route key="catalogo" path="/catalogo" element={<Catalogo />} />,
  <Route key="vehiculos-redirect" path="/vehiculos" element={<Navigate to="/catalogo" replace />} />,
  <Route key="contacto" path="/contacto" element={<Contact />} />,
  <Route key="financiamiento" path="/financiamiento" element={<Financing />} />,
  <Route key="citas" path="/citas" element={<Citas />} />,
  <Route key="seminuevos" path="/seminuevos" element={<Seminuevos />} />,
  <Route key="test-drive" path="/prueba-de-manejo" element={<PrivateRoute><TestDrive /></PrivateRoute>} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="registro" path="/registro" element={<Register />} />,
  <Route key="servicio-home" path="/servicio" element={<ServicioHome />} />,
  <Route key="servicio-agendar" path="/servicio/agendar" element={<ServicioAgendar />} />,
  <Route key="servicio-mis-citas-redirect" path="/servicio/mis-citas" element={<Navigate to="/cliente/mis-citas-servicio" replace />} />,
]

export default publicRoutes
