import { createContext, useContext, useState } from 'react'
import {
  initialVehicles, initialDrivers, initialManagement,
  initialTrips, initialJobHistory,
} from '../data/store'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [drivers, setDrivers] = useState(initialDrivers)
  const [management, setManagement] = useState(initialManagement)
  const [trips, setTrips] = useState(initialTrips)
  const [jobHistory, setJobHistory] = useState(initialJobHistory)

  // Assign a vehicle to a driver (bidirectional)
  const assignVehicle = (driverId, vehicleNumber) => {
    setDrivers(ds => ds.map(d => {
      if (d.driverId === driverId) return { ...d, assignedVehicle: vehicleNumber }
      if (d.assignedVehicle === vehicleNumber) return { ...d, assignedVehicle: null }
      return d
    }))
    setVehicles(vs => vs.map(v => {
      if (v.vehicleNumber === vehicleNumber) return { ...v, assignedDriver: driverId }
      if (v.assignedDriver === driverId) return { ...v, assignedDriver: null }
      return v
    }))
  }

  // Remove vehicle assignment from a driver
  const deassignVehicle = (driverId) => {
    const driver = drivers.find(d => d.driverId === driverId)
    if (!driver?.assignedVehicle) return
    const vNum = driver.assignedVehicle
    setDrivers(ds => ds.map(d => d.driverId === driverId ? { ...d, assignedVehicle: null } : d))
    setVehicles(vs => vs.map(v => v.vehicleNumber === vNum ? { ...v, assignedDriver: null } : v))
  }

  return (
    <DataContext.Provider value={{
      vehicles, setVehicles,
      drivers, setDrivers,
      management, setManagement,
      trips, setTrips,
      jobHistory, setJobHistory,
      assignVehicle,
      deassignVehicle,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
