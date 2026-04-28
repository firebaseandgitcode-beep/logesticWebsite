const BASE = import.meta.env.VITE_API_URL ||
  'https://us-central1-mylogestic1.cloudfunctions.net/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('logestic_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data })
  return data
}

export const api = {
  // Auth
  register:       (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:          (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:             ()     => request('/auth/me'),
  updateProfile:  (body) => request('/auth/profile',  { method: 'PUT',  body: JSON.stringify(body) }),
  updatePassword: (body) => request('/auth/password', { method: 'PUT',  body: JSON.stringify(body) }),

  // File upload
  upload: (data, folder) => request('/upload', { method: 'POST', body: JSON.stringify({ data, folder }) }),

  // Vehicles
  getVehicles:   ()         => request('/vehicles'),
  createVehicle: (body)     => request('/vehicles',     { method: 'POST',   body: JSON.stringify(body) }),
  updateVehicle: (id, body) => request(`/vehicles/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteVehicle: (id)       => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Drivers
  getDrivers:   ()         => request('/drivers'),
  createDriver: (body)     => request('/drivers',     { method: 'POST',   body: JSON.stringify(body) }),
  updateDriver: (id, body) => request(`/drivers/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteDriver: (id)       => request(`/drivers/${id}`, { method: 'DELETE' }),

  // Management
  getManagement: ()         => request('/management'),
  createStaff:   (body)     => request('/management',     { method: 'POST',   body: JSON.stringify(body) }),
  updateStaff:   (id, body) => request(`/management/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteStaff:   (id)       => request(`/management/${id}`, { method: 'DELETE' }),

  // Trips
  getTrips:   ()         => request('/trips'),
  createTrip: (body)     => request('/trips',     { method: 'POST',   body: JSON.stringify(body) }),
  updateTrip: (id, body) => request(`/trips/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteTrip: (id)       => request(`/trips/${id}`, { method: 'DELETE' }),
}
