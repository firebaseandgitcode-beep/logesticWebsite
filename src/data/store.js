// In-memory store — replaced by API calls when backend is ready

export const initialVehicles = [
  {
    id: 1, vehicleNumber: 'MH12AB1234', vehicleType: 'Truck', make: 'Tata', type: 'Heavy',
    status: 'active', assignedDriver: 'DRV001', rcCard: null,
    insurance: { file: null, expiry: '2025-12-31' },
    pollution: { file: null, expiry: '2025-06-30' },
  },
  {
    id: 2, vehicleNumber: 'DL3CX5678', vehicleType: 'Van', make: 'Mahindra', type: 'Light',
    status: 'active', assignedDriver: 'DRV002', rcCard: null,
    insurance: { file: null, expiry: '2026-03-15' },
    pollution: { file: null, expiry: '2025-09-10' },
  },
  {
    id: 3, vehicleNumber: 'KA05MN9999', vehicleType: 'Truck', make: 'Ashok Leyland', type: 'Medium',
    status: 'inactive', assignedDriver: null, rcCard: null,
    insurance: { file: null, expiry: '2024-11-01' },
    pollution: { file: null, expiry: '2024-08-20' },
  },
  {
    id: 4, vehicleNumber: 'TN09ZZ4321', vehicleType: 'Truck', make: 'Eicher', type: 'Medium',
    status: 'active', assignedDriver: null, rcCard: null,
    insurance: { file: null, expiry: '2026-08-01' },
    pollution: { file: null, expiry: '2026-05-15' },
  },
]

export const initialDrivers = [
  {
    id: 1, driverId: 'DRV001', name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@example.com',
    licence: 'MH-1420230012345', bankDetails: { account: '****4521', ifsc: 'SBIN0001234', bank: 'SBI' },
    status: 'active', avatar: null, assignedVehicle: 'MH12AB1234',
  },
  {
    id: 2, driverId: 'DRV002', name: 'Suresh Patil', phone: '9823456710', email: 'suresh@example.com',
    licence: 'DL-0420220054321', bankDetails: { account: '****8832', ifsc: 'HDFC0001234', bank: 'HDFC' },
    status: 'active', avatar: null, assignedVehicle: 'DL3CX5678',
  },
  {
    id: 3, driverId: 'DRV003', name: 'Anand Singh', phone: '9011223344', email: 'anand@example.com',
    licence: 'KA-0520210078901', bankDetails: { account: '****2211', ifsc: 'ICIC0001234', bank: 'ICICI' },
    status: 'inactive', avatar: null, assignedVehicle: null,
  },
]

export const initialManagement = [
  {
    id: 1, managerId: 'MGR001', name: 'Priya Sharma', phone: '9900112233', email: 'priya@mylogestic.com',
    avatar: null, role: 'Trip Creator', customRole: '', jobs: ['create_trip'],
    username: 'priya.sharma', password: 'Pass@1234',
    bankDetails: { account: '****7745', ifsc: 'UTIB0001234', bank: 'Axis' }, status: 'active',
  },
  {
    id: 2, managerId: 'MGR002', name: 'Vikram Desai', phone: '9811223344', email: 'vikram@mylogestic.com',
    avatar: null, role: 'Trip Manager', customRole: '', jobs: ['manage_trip', 'fuel_details'],
    username: 'vikram.desai', password: 'Pass@5678',
    bankDetails: { account: '****3390', ifsc: 'HDFC0002345', bank: 'HDFC' }, status: 'active',
  },
]

export const initialTrips = [
  {
    id: 1,
    status: 'completed',
    // Part 1 — Create Trip
    date: '2026-04-10',
    originCustomer: 'ABC Traders', originCity: 'Mumbai', originState: 'MH',
    destCustomer: 'XYZ Distributors', destCity: 'Pune', destState: 'MH',
    commodity: 'Electronics', tons: 5,
    driverId: 'DRV001', vehicleNumber: 'MH12AB1234',
    documents: [],
    notes: 'Handle with care',
    verifiedCreate: true,
    otherExpenses: [{ id: 1, type: 'Loading', amount: 500, billImage: null, description: 'Loading charges at origin' }],
    driverPayment: { totalAmount: 3000, advance: 1500 },
    // Part 2 — Fuel Details
    fuelEntries: [
      { id: 1, date: '2026-04-10', odometer: 45000, litres: 40, perLtrCost: 105, billImage: null },
    ],
    fuelVerified: true,
    // Part 3 — Manage Trip
    rateType: 'freight', costPerTon: 800, flatAmount: 0,
    tollExpense: 450,
    managedExpenses: [],
    verifiedManage: true, verifiedTripDetails: true, verifiedFuelDetails: true,
  },
  {
    id: 2,
    status: 'completed',
    date: '2026-04-14',
    originCustomer: 'Fresh Farms', originCity: 'Delhi', originState: 'DL',
    destCustomer: 'Retail Hub', destCity: 'Jaipur', destState: 'RJ',
    commodity: 'Dry Goods', tons: 8,
    driverId: 'DRV002', vehicleNumber: 'DL3CX5678',
    documents: [],
    notes: 'Toll charges included',
    verifiedCreate: true,
    otherExpenses: [{ id: 1, type: 'Unloading', amount: 600, billImage: null, description: 'Unloading at destination' }],
    driverPayment: { totalAmount: 4000, advance: 2000 },
    fuelEntries: [
      { id: 1, date: '2026-04-14', odometer: 67000, litres: 60, perLtrCost: 104, billImage: null },
    ],
    fuelVerified: true,
    rateType: 'flat', costPerTon: 0, flatAmount: 4500,
    tollExpense: 650,
    managedExpenses: [],
    verifiedManage: true, verifiedTripDetails: true, verifiedFuelDetails: true,
  },
  {
    id: 3,
    status: 'in_progress',
    date: '2026-04-18',
    originCustomer: 'AutoParts Co', originCity: 'Bangalore', originState: 'KA',
    destCustomer: 'Service Hub', destCity: 'Chennai', destState: 'TN',
    commodity: 'Auto Parts', tons: 10,
    driverId: 'DRV001', vehicleNumber: 'MH12AB1234',
    documents: [],
    notes: '',
    verifiedCreate: true,
    otherExpenses: [],
    driverPayment: { totalAmount: 5000, advance: 2000 },
    fuelEntries: [
      { id: 1, date: '2026-04-18', odometer: 45150, litres: 50, perLtrCost: 106, billImage: null },
    ],
    fuelVerified: false,
    rateType: 'freight', costPerTon: 700, flatAmount: 0,
    tollExpense: 0,
    managedExpenses: [],
    verifiedManage: false, verifiedTripDetails: false, verifiedFuelDetails: false,
  },
  {
    id: 4,
    status: 'planned',
    date: '2026-04-22',
    originCustomer: 'FMCG Corp', originCity: 'Hyderabad', originState: 'TS',
    destCustomer: 'City Store', destCity: 'Vijayawada', destState: 'AP',
    commodity: 'FMCG', tons: 7.5,
    driverId: null, vehicleNumber: null,
    documents: [],
    notes: 'Confirm loading time with warehouse',
    verifiedCreate: false,
    otherExpenses: [],
    driverPayment: { totalAmount: 0, advance: 0 },
    fuelEntries: [],
    fuelVerified: false,
    rateType: 'freight', costPerTon: 0, flatAmount: 0,
    tollExpense: 0,
    managedExpenses: [],
    verifiedManage: false, verifiedTripDetails: false, verifiedFuelDetails: false,
  },
]

export const initialJobHistory = [
  { id: 1, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Mumbai → Pune (Trip #1)', date: '2026-04-10' },
  { id: 2, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Delhi → Jaipur (Trip #2)', date: '2026-04-14' },
  { id: 3, managerId: 'MGR001', jobType: 'create_trip', description: 'Created trip: Bangalore → Chennai (Trip #3)', date: '2026-04-18' },
  { id: 4, managerId: 'MGR002', jobType: 'fuel_details', description: 'Added fuel entry ₹6,240 for DL3CX5678', date: '2026-04-14' },
  { id: 5, managerId: 'MGR002', jobType: 'manage_trip', description: 'Completed Trip #2 (Delhi → Jaipur)', date: '2026-04-16' },
  { id: 6, managerId: 'MGR002', jobType: 'fuel_details', description: 'Added fuel entry ₹5,300 for MH12AB1234', date: '2026-04-18' },
  { id: 7, managerId: 'MGR002', jobType: 'manage_trip', description: 'Managed Trip #3 — in progress', date: '2026-04-18' },
]

// ─── ID generators ────────────────────────────────────────────────────────────

export function generateDriverId(drivers) {
  const max = drivers.reduce((m, d) => Math.max(m, parseInt(d.driverId.replace('DRV', ''), 10)), 0)
  return `DRV${String(max + 1).padStart(3, '0')}`
}

export function generateManagerId(managers) {
  const max = managers.reduce((m, mgr) => Math.max(m, parseInt(mgr.managerId.replace('MGR', ''), 10)), 0)
  return `MGR${String(max + 1).padStart(3, '0')}`
}

// ─── Trip helpers ─────────────────────────────────────────────────────────────

export function tripOrigin(trip) {
  return [trip.originCity, trip.originState].filter(Boolean).join(', ')
}

export function tripDest(trip) {
  return [trip.destCity, trip.destState].filter(Boolean).join(', ')
}

export function tripRevenue(trip) {
  if (trip.rateType === 'flat') return Number(trip.flatAmount) || 0
  return (Number(trip.tons) || 0) * (Number(trip.costPerTon) || 0)
}

export function tripFuelCost(trip) {
  return (trip.fuelEntries || []).reduce((s, f) =>
    s + ((Number(f.litres) || 0) * (Number(f.perLtrCost) || 0)), 0)
}

export function tripAllExpenses(trip) {
  const e1 = (trip.otherExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const e2 = (trip.managedExpenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0)
  return e1 + e2 + (Number(trip.tollExpense) || 0) + tripDriverSalary(trip)
}

export function tripNetPay(trip) {
  return tripRevenue(trip) - tripFuelCost(trip) - tripAllExpenses(trip)
}

export function tripDriverSalary(trip) {
  return Number(trip.driverPayment?.totalAmount) || 0
}

export function tripDriverAdvance(trip) {
  return Number(trip.driverPayment?.advance) || 0
}

export function tripDriverDue(trip) {
  if (trip.driverPayment?.duePaid) return 0
  return Math.max(tripDriverSalary(trip) - tripDriverAdvance(trip), 0)
}

export function tripDriverPaid(trip) {
  return tripDriverSalary(trip) - tripDriverDue(trip)
}

export function tripStatus(form) {
  if (
    form.verifiedCreate &&
    form.fuelVerified &&
    form.verifiedManage &&
    form.verifiedTripDetails &&
    form.verifiedFuelDetails
  ) return 'completed'
  if (form.verifiedCreate) return 'in_progress'
  return 'planned'
}

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export function isExpiringSoon(dateStr) {
  if (!dateStr) return false
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 30
}

export function isExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}
