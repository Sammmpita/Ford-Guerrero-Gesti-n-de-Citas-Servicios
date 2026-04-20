const BASE_URL = '/api'

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
})

const handleResponse = async (res) => {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ---------------------------------------------------------------------------
// Citas de prueba de manejo
// ---------------------------------------------------------------------------
export const citasApi = {
  listar: (token) =>
    fetch(`${BASE_URL}/citas/`, { headers: getAuthHeaders(token) }).then(handleResponse),

  crear: (data, token) =>
    fetch(`${BASE_URL}/citas/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),

  cancelar: (id, token) =>
    fetch(`${BASE_URL}/citas/${id}/cancelar/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
    }).then(handleResponse),
}

// ---------------------------------------------------------------------------
// Servicio técnico (taller)
// ---------------------------------------------------------------------------
export const servicioApi = {
  listar: (token) =>
    fetch(`${BASE_URL}/servicio/citas/`, { headers: getAuthHeaders(token) }).then(handleResponse),

  crear: (data) =>
    fetch(`${BASE_URL}/servicio/citas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  cancelar: (id, motivo, token) =>
    fetch(`${BASE_URL}/servicio/citas/${id}/cancelar/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ motivo }),
    }).then(handleResponse),

  dashboard: (fecha, token) =>
    fetch(`${BASE_URL}/servicio/citas/dashboard/?fecha=${fecha}`, {
      headers: getAuthHeaders(token),
    }).then(handleResponse),

  buscar: (q, token) =>
    fetch(`${BASE_URL}/servicio/citas/buscar/?q=${encodeURIComponent(q)}`, {
      headers: getAuthHeaders(token),
    }).then(handleResponse),

  cambiarEstatus: (id, data, token) =>
    fetch(`${BASE_URL}/servicio/citas/${id}/cambiar_estatus/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),

  cambiarBahia: (id, data, token) =>
    fetch(`${BASE_URL}/servicio/citas/${id}/cambiar_bahia/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),

  guardarNotas: (id, data, token) =>
    fetch(`${BASE_URL}/servicio/citas/${id}/guardar_notas/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ---------------------------------------------------------------------------
// Catálogo de vehículos
// ---------------------------------------------------------------------------
export const autosApi = {
  listar: () =>
    fetch(`${BASE_URL}/autos/vehiculos/`).then(handleResponse),

  categorias: () =>
    fetch(`${BASE_URL}/autos/categorias/`).then(handleResponse),

  detalle: (id) =>
    fetch(`${BASE_URL}/autos/vehiculos/${id}/`).then(handleResponse),

  crear: (data, token) =>
    fetch(`${BASE_URL}/autos/vehiculos/`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),

  actualizar: (id, data, token) =>
    fetch(`${BASE_URL}/autos/vehiculos/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),

  eliminar: (id, token) =>
    fetch(`${BASE_URL}/autos/vehiculos/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    }),
}

// ---------------------------------------------------------------------------
// Usuarios (admin)
// ---------------------------------------------------------------------------
export const usuariosApi = {
  listar: (token) =>
    fetch(`${BASE_URL}/accounts/usuarios/`, { headers: getAuthHeaders(token) }).then(handleResponse),

  actualizar: (id, data, token) =>
    fetch(`${BASE_URL}/accounts/usuarios/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),
}

// ---------------------------------------------------------------------------
// Vendedores
// ---------------------------------------------------------------------------
export const vendedoresApi = {
  listar: (token) =>
    fetch(`${BASE_URL}/vendedores/`, { headers: getAuthHeaders(token) }).then(handleResponse),

  disponibilidad: (id, token) =>
    fetch(`${BASE_URL}/vendedores/${id}/disponibilidad/`, {
      headers: getAuthHeaders(token),
    }).then(handleResponse),

  actualizarDisponibilidad: (id, data, token) =>
    fetch(`${BASE_URL}/vendedores/${id}/disponibilidad/`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }).then(handleResponse),
}
