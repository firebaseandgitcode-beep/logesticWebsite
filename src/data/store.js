// In-memory store for static prototype — will be replaced by API calls

export const initialVehicles = [
  {
    id: 1,
    vehicleNumber: 'MH12AB1234',
    vehicleType: 'Truck',
    make: 'Tata',
    type: 'Heavy',
    status: 'active',
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
    rcCard: null,
    insurance: { file: null, expiry: '2024-11-01' },
    pollution: { file: null, expiry: '2024-08-20' },
  },
]

export const initialDrivers = [
  {
    id: 1,
    driverId: 'DRV001',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    licence: 'MH-1420230012345',
    bankDetails: { account: '****4521', bank: 'SBI' },
    status: 'active',
  },
  {
    id: 2,
    driverId: 'DRV002',
    name: 'Suresh Patil',
    phone: '9823456710',
    licence: 'DL-0420220054321',
    bankDetails: { account: '****8832', bank: 'HDFC' },
    status: 'active',
  },
  {
    id: 3,
    driverId: 'DRV003',
    name: 'Anand Singh',
    phone: '9011223344',
    licence: 'KA-0520210078901',
    bankDetails: { account: '****2211', bank: 'ICICI' },
    status: 'inactive',
  },
]

export const initialManagement = [
  {
    id: 1,
    managerId: 'MGR001',
    name: 'Priya Sharma',
    phone: '9900112233',
    role: 'Fleet Manager',
    bankDetails: { account: '****7745', bank: 'Axis' },
    status: 'active',
  },
  {
    id: 2,
    managerId: 'MGR002',
    name: 'Vikram Desai',
    phone: '9811223344',
    role: 'Operations Head',
    bankDetails: { account: '****3390', bank: 'HDFC' },
    status: 'active',
  },
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
  },
]

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
