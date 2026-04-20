import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ford_access'
const REFRESH_KEY = 'ford_refresh'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async (token) => {
    const res = await fetch('/api/accounts/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Sesión inválida')
    return res.json()
  }, [])

  // Restaurar sesión al montar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setLoading(false))
  }, [fetchMe])

  const login = async (email, password) => {
    const res = await fetch('/api/accounts/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data?.detail || 'Credenciales incorrectas.')
    }
    const { access, refresh } = await res.json()
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    const me = await fetchMe(access)
    setUser(me)
    return me
  }

  const register = async ({ email, password, password2, first_name, last_name, telefono }) => {
    const res = await fetch('/api/accounts/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, password2, first_name, last_name, telefono }),
    })
    if (!res.ok) {
      const data = await res.json()
      // Devuelve el primer error encontrado para mostrarlo en el formulario
      const firstKey = Object.keys(data)[0]
      const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]
      throw new Error(msg || 'Error al crear la cuenta.')
    }
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
  }

  const getToken = () => localStorage.getItem(TOKEN_KEY)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
