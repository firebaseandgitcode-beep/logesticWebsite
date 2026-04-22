// In-memory store — replaced by API calls when backend is ready

export const initialVehicles = [
  {
    id: 1,
    vehicleNumber: 'MH12AB1234',
    vehicleType: 'Truck',
    make: 'Tata',
    type: 'Heavy',
    status: 'active',
    assignedDriver: 'DRV001',
    rcCard: null,
    insurance: { file: null, expiry: '2025-12-31' },
    pollution: { file: null, expiry: '2025-06-30' },
  },
  {
    id: 2,
    vehicleNumber: 'DL3CX5678',
    vehicleType: 'Van',
    make: 'Mahindra',
    type: 'Light',
    status: 'active',
    assignedDriver: 'DRV002',
    rcCard: null,
    insurance: { file: null, expiry: '2026-03-15' },
    pollution: { file: null, expiry: '2025-09-10' },
  },
  {
    id: 3,
    vehicleNumber: 'KA05MN9999',
    vehicleType: 'Truck',
    make: 'Ashok Leyland',
    type: 'Medium',
    status: 'inactive',
    assignedDriver: null,
    rcCard: null,
    insurance: { file: null, expiry: '2024-11-01' },
    pollution: { file: null, expiry: '2024-08-20' },
  },
  {
    id: 4,
    vehicleNumber: 'TN09ZZ4321',
    vehicleType: 'Truck',
    make: 'Eicher',
    type: 'Medium',
    status: 'active',
    assignedDriver: null,
    rcCard: null,
    insurance: { file: null, expiry: '2026-08-01' },
    pollution: { file: null, expiry: '2026-05-15' },
  },
]

export const initialDrivers = [
  {
    id: 1,
    driverId: 'DRV001',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    email: 'ramesh@example.com',
    licence: 'MH-1420230012345',
    bankDetails: { account: '****4521', ifsc: 'SBIN0001234', bank: 'SBI' },
    status: 'active',
    avatar: null,
    assignedVehicle: 'MH12AB1234',
  },
  {
    id: 2,
    driverId: 'DRV002',
    name: 'Suresh Patil',
    phone: '9823456710',
    email: 'suresh@example.com',
    licence: 'DL-0420220054321',
    bankDetails: { account: '****8832', ifsc: 'HDFC0001234', bank: 'HDFC' },
    status: 'active',
    avatar: null,
    assignedVehicle: 'DL3CX5678',
  },
  {
    id: 3,
    driverId: 'DRV003',
    name: 'Anand Singh',
    phone: '9011223344',
    email: 'anand@example.com',
    licence: 'KA-0520210078901',
    bankDetails: { account: '****2211', ifsc: 'ICIC0001234', bank: 'ICICI' },
    status: 'inactive',
    avatar: null,
    assignedVehicle: null,
  },
]

export const initialManagement = [
  {
    id: 1,
    managerId: 'MGR001',
    name: 'Priya Sharma',
    phone: '9900112233',
    email: 'priya@mylogestic.com',
    avatar: null,
    role: 'Trip Creator',
    customRole: '',
    jobs: ['create_trip'],
    username: 'priya.sharma',
    password: 'Pass@1234',
    bankDetails: { account: '****7745', ifsc: 'UTIB0001234', bank: 'Axis' },
    status: 'active',
  },
  {
    id: 2,
    managerId: 'MGR002',
    name: 'Vikram Desai',
    phone: '9811223344',
    email: 'vikram@mylogestic.com',
    avatar: null,
    role: 'Trip Manager',
    customRole: '',
    jobs: ['manage_trip', 'fuel_details'],
    username: 'vikram.desai',
    password: 'Pass@5678',
    bankDetails: { account: '****3390', ifsc: 'HDFC0002345', bank: 'HDFC' },
    status: 'active',
  },
]

export const initialTrips = [
  {
    id: 1,
    date: '2026-04-10',
    origin: 'Mumbai, MH',
    destination: 'Pune, MH',
    miles: 150,
    ratePerMile: 12,
    flatRate: 0,
    fuelCost: 800,
    otherExpenses: 200,
    loadWeight: 5000,
    commodity: 'Electronics',
    status: 'completed',
    notes: '',
    driverId: 'DRV001',
    vehicleNumber: 'MH12AB1234',
  },
  {
    id: 2,
    date: '2026-04-14',
    origin: 'Delhi, DL',
    destination: 'Jaipur, RJ',
    miles: 280,
    ratePerMile: 0,
    flatRate: 4500,
    fuelCost: 1400,
    otherExpenses: 300,
    loadWeight: 8000,
    commodity: 'Dry Goods',
    status: 'completed',
    notes: 'Toll charges included in expenses',
    driverId: 'DRV002',
    vehicleNumber: 'DL3CX5678',
  },
  {
    id: 3,
    date: '2026-04-18',
    origin: 'Bangalore, KA',
    destination: 'Chennai, TN',
    miles: 350,
    ratePerMile: 10,
    flatRate: 0,
    fuelCost: 1800,
    otherExpenses: 500,
    loadWeight: 10000,
    commodity: 'Auto Parts',
    status: 'in_progress',
    notes: '',
    driverId: 'DRV001',
    vehicleNumber: 'MH12AB1234',
  },
  {
    id: 4,
    date: '2026-04-22',
    origin: 'Hyderabad, TS',
    destination: 'Vijayawada, AP',
    miles: 270,
    ratePerMile: 11,
    flatRate: 0,
    fuelCost: 0,
    otherExpenses: 0,
    loadWeight: 7500,
    commodity: 'FMCG',
    status: 'planned',
    notes: 'Confirm loading time with warehouse',
    driverId: null,
    vehicleNumber: null,
  },
]

export const initialJobHistory = [
  { id: 1, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Mumbai, MH → Pune, MH', date: '2026-04-10' },
  { id: 2, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Delhi, DL → Jaipur, RJ', date: '2026-04-14' },
  { id: 3, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Bangalore, KA → Chennai, TN', date: '2026-04-18' },
  { id: 4, managerId: 'MGR002', jobType: 'fuel_details', description: 'Added fuel entry ₹1,400 for DL3CX5678', date: '2026-04-14' },
  { id: 5, managerId: 'MGR002', jobType: 'manage_trip', description: 'Updated trip #2 status to Completed', date: '2026-04-16' },
  { id: 6, managerId: 'MGR002', jobType: 'fuel_details', description: 'Added fuel entry ₹1,800 for MH12AB1234', date: '2026-04-18' },
  { id: 7, managerId: 'MGR002', jobType: 'manage_trip', description: 'Assigned driver DRV001 to trip #3', date: '2026-04-18' },
]

export function generateDriverId(drivers) {
  const max = drivers.reduce((m, d) => {
    const n = parseInt(d.driverId.replace('DRV', ''), 10)
    return n > m ? n : m
  }, 0)
  return `DRV${String(max + 1).padStart(3, '0')}`
}

export function generateManagerId(managers) {
  const max = managers.reduce((m, mgr) => {
    const n = parseInt(mgr.managerId.replace('MGR', ''), 10)
    return n > m ? n : m
  }, 0)
  return `MGR${String(max + 1).padStart(3, '0')}`
}

export function tripRevenue(trip) {
  return trip.flatRate > 0 ? trip.flatRate : trip.miles * trip.ratePerMile
}

export function tripNetPay(trip) {
  return tripRevenue(trip) - trip.fuelCost - trip.otherExpenses
}

export function isExpiringSoon(dateStr) {
  if (!dateStr) return false
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
}

export function isExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}
