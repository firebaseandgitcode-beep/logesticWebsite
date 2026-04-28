import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'
import { initialDrivers, initialManagement, initialTrips, initialVehicles } from '../data/store'

const DataContext = createContext(null)

// Recursively walk an object/array and upload any base64 image strings.
// Returns a new object with all base64 values replaced by Cloud Storage URLs.
async function uploadAllBase64(obj, folder) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => uploadAllBase64(item, folder)))
  }
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = await uploadAllBase64(value, folder)
    }
    return result
  }
  if (typeof obj === 'string' && obj.startsWith('data:image')) {
    const { url } = await api.upload(obj, folder)
    return url
  }
  return obj
}

export function DataProvider({ children }) {
  const { currentUser } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [management, setManagement] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ─── Load all collections ──────────────────────────────────────────────────

  const loadVehicles = useCallback(async () => {
    const data = await api.getVehicles()
    setVehicles(data.vehicles || [])
  }, [])

  const loadDrivers = useCallback(async () => {
    const data = await api.getDrivers()
    setDrivers(data.drivers || [])
  }, [])

  const loadManagement = useCallback(async () => {
    const data = await api.getManagement()
    const staff = data.management || data.staff || []
    setManagement(staff)
  }, [])

  const loadTrips = useCallback(async () => {
    const data = await api.getTrips()
    setTrips(data.trips || [])
  }, [])

  const refresh = useCallback(async () => {
    try {
      await Promise.all([loadVehicles(), loadDrivers(), loadManagement(), loadTrips()])
    } catch (err) {
      setError(err.message)
      if (import.meta.env.DEV) {
        setVehicles(initialVehicles)
        setDrivers(initialDrivers)
        setManagement(initialManagement)
        setTrips(initialTrips)
      }
    }
  }, [loadVehicles, loadDrivers, loadManagement, loadTrips])

  useEffect(() => {
    if (!currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVehicles([])
      setDrivers([])
      setManagement([])
      setTrips([])
      return
    }
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [currentUser, refresh]) // re-fetch whenever the logged-in user changes

  // ─── Upload helper ─────────────────────────────────────────────────────────

  const uploadFile = async (base64, folder) => {
    const { url } = await api.upload(base64, folder)
    return url
  }

  // ─── Vehicles ──────────────────────────────────────────────────────────────

  const createVehicle = async (form) => {
    const cleaned = await uploadAllBase64(form, 'vehicles')
    await api.createVehicle(cleaned)
    await loadVehicles()
  }

  const updateVehicle = async (id, form) => {
    const cleaned = await uploadAllBase64(form, 'vehicles')
    await api.updateVehicle(id, cleaned)
    await loadVehicles()
  }

  const deleteVehicle = async (id) => {
    await api.deleteVehicle(id)
    await loadVehicles()
  }

  // ─── Drivers ───────────────────────────────────────────────────────────────

  const createDriver = async (form) => {
    const cleaned = await uploadAllBase64(form, 'drivers')
    await api.createDriver(cleaned)
    await loadDrivers()
  }

  const updateDriver = async (id, form) => {
    const cleaned = await uploadAllBase64(form, 'drivers')
    await api.updateDriver(id, cleaned)
    await loadDrivers()
  }

  const deleteDriver = async (id) => {
    await api.deleteDriver(id)
    await loadDrivers()
  }

  // assignVehicle: driverId is the logical "DRV001"-style ID, not Firestore doc id
  const assignVehicle = async (driverId, vehicleNumber) => {
    const driver = drivers.find(d => d.driverId === driverId)
    if (!driver) return
    await api.updateDriver(driver.id, { assignedVehicle: vehicleNumber })
    await Promise.all([loadDrivers(), loadVehicles()])
  }

  const deassignVehicle = async (driverId) => {
    const driver = drivers.find(d => d.driverId === driverId)
    if (!driver) return
    await api.updateDriver(driver.id, { assignedVehicle: null })
    await Promise.all([loadDrivers(), loadVehicles()])
  }

  // ─── Management ────────────────────────────────────────────────────────────

  const createStaff = async (form) => {
    const cleaned = await uploadAllBase64(form, 'management')
    await api.createStaff(cleaned)
    await loadManagement()
  }

  const updateStaff = async (id, form) => {
    const cleaned = await uploadAllBase64(form, 'management')
    await api.updateStaff(id, cleaned)
    await loadManagement()
  }

  const deleteStaff = async (id) => {
    await api.deleteStaff(id)
    await loadManagement()
  }

  // ─── Trips ─────────────────────────────────────────────────────────────────

  const createTrip = async (form) => {
    const cleaned = await uploadAllBase64(form, 'trips')
    const { trip } = await api.createTrip(cleaned)
    await loadTrips()
    return trip
  }

  const updateTrip = async (id, form) => {
    const cleaned = await uploadAllBase64(form, 'trips')
    const { trip } = await api.updateTrip(id, cleaned)
    await loadTrips()
    return trip
  }

  const deleteTrip = async (id) => {
    await api.deleteTrip(id)
    await loadTrips()
  }

  return (
    <DataContext.Provider value={{
      vehicles, drivers, management, trips,
      loading, error,
      uploadFile,
      createVehicle, updateVehicle, deleteVehicle,
      createDriver, updateDriver, deleteDriver,
      assignVehicle, deassignVehicle,
      createStaff, updateStaff, deleteStaff,
      createTrip, updateTrip, deleteTrip,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext)
