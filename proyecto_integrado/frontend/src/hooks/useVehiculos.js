import { useState, useEffect } from 'react'

/**
 * Obtiene vehículos y categorías del API.
 * @param {object} opciones
 * @param {number|null} opciones.limit  - Corta la lista al número indicado.
 */
const useVehiculos = ({ limit = null } = {}) => {
  const [vehiculos, setVehiculos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/autos/vehiculos/')
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json()
      })
      .then((data) => {
        const lista = Array.isArray(data) ? data : (data.results ?? [])
        setVehiculos(limit ? lista.slice(0, limit) : lista)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [limit])

  useEffect(() => {
    fetch('/api/autos/categorias/')
      .then((r) => r.json())
      .then((data) => setCategorias(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
  }, [])

  return { vehiculos, categorias, loading, error }
}

export default useVehiculos
