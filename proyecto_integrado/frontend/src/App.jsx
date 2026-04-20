import { BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import publicRoutes from './routes/publicRoutes'
import adminRoutes from './routes/adminRoutes'
import vendedorRoutes from './routes/vendedorRoutes'
import clienteRoutes from './routes/clienteRoutes'
import encargadoRoutes from './routes/encargadoRoutes'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {publicRoutes}
        {adminRoutes}
        {vendedorRoutes}
        {clienteRoutes}
        {encargadoRoutes}
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
