import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { servicioApi } from '../services/api'

const useCitasServicio = () => {
  const { getToken } = useAuth()
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    setError(null)
    servicioApi
      .listar(getToken())
      .then((data) => setCitas(Array.isArray(data) ? data : data.results || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [getToken])

  useEffect(() => {
    cargar()
  }, [cargar])

  const cancelar = async (id, motivo = 'Cancelado por el cliente') => {
    await servicioApi.cancelar(id, motivo, getToken())
    cargar()
  }

  return { citas, loading, error, recargar: cargar, cancelar }
}

export default useCitasServicio
