import { useState } from 'react'
import { Plus, Search, Upload, FileText, ArrowLeft, Eye } from 'lucide-react'
import { isExpired, isExpiringSoon, tripRevenue, tripNetPay, tripOrigin, tripDest } from '../data/store'
import { useData } from '../context/DataContext'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

// ─── Vehicle Detail View ──────────────────────────────────────────────────────

function VehicleDetail({ vehicle, drivers, trips, onBack, onEdit }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const driver = drivers.find(d => d.driverId === vehicle.assignedDriver)
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const vehicleTrips = trips
    .filter(t => {
      if (t.vehicleNumber !== vehicle.vehicleNumber) return false
      if (from && t.date < from) return false
      if (to && t.date > to) return false
      return true
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  const totalRevenue = vehicleTrips.reduce((sum, trip) => sum + tripRevenue(trip), 0)
  const totalNet = vehicleTrips.reduce((sum, trip) => sum + tripNetPay(trip), 0)
  const completedTrips = vehicleTrips.filter(trip => trip.status === 'completed').length
  const latestTrip = vehicleTrips[0]

  const docSt = (expiry) => {
    if (isExpired(expiry)) return { label: 'Expired', cls: 'text-red-600 bg-red-50 border-red-200' }
    if (isExpiringSoon(expiry)) return { label: 'Expiring Soon', cls: 'text-amber-600 bg-amber-50 border-amber-200' }
    return { label: 'Valid', cls: 'text-green-600 bg-green-50 border-green-200' }
  }

  const STATUS_STYLES = {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    planned: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Vehicles
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Edit Vehicle
        </button>
      </div>

      {/* Vehicle info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-mono">{vehicle.vehicleNumber}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{vehicle.make} · {vehicle.vehicleType} · {vehicle.type}</p>
          </div>
          <Badge status={vehicle.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400">RC Card</p>
            <p className="text-sm font-medium text-gray-700">{vehicle.rcCard ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Insurance</p>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${docSt(vehicle.insurance.expiry).cls}`}>
              {docSt(vehicle.insurance.expiry).label} · {vehicle.insurance.expiry}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Pollution Cert</p>
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${docSt(vehicle.pollution.expiry).cls}`}>
              {docSt(vehicle.pollution.expiry).label} · {vehicle.pollution.expiry}
            </span>
          </div>
        </div>

        {/* Assigned driver */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 mb-2">Assigned Driver</p>
          {driver ? (
            <div className="flex items-center gap-3">
              <Avatar src={driver.avatar} name={driver.name} size="md" color="emerald" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{driver.name}</p>
                <p className="text-xs text-gray-400 font-mono">{driver.driverId} · {driver.phone}</p>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">No driver assigned</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Rides', value: vehicleTrips.length, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Completed', value: completedTrips, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Revenue', value: fmt(totalRevenue), tone: 'text-violet-700 bg-violet-50 border-violet-200' },
          { label: 'Net Pay', value: fmt(totalNet), tone: `${totalNet >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}` },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.tone}`}>
            <p className="text-xs opacity-70">{card.label}</p>
            <p className="mt-1 text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {latestTrip && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Latest Ride</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {latestTrip.originCustomer || 'Origin Customer'} to {latestTrip.destCustomer || 'Destination Customer'}
              </p>
              <p className="text-sm text-gray-600">{tripOrigin(latestTrip)} to {tripDest(latestTrip)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Driver</p>
              <p className="text-sm font-semibold text-gray-900">
                {drivers.find(d => d.driverId === latestTrip.driverId)?.name || latestTrip.driverId || 'Unassigned'}
              </p>
              <p className="text-xs text-gray-500">{latestTrip.commodity || 'Goods'} {latestTrip.tons ? `· ${latestTrip.tons} tons` : ''}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trip history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Ride History</h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <label className="text-xs text-gray-500">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            {(from || to) && (
              <button onClick={() => { setFrom(''); setTo('') }} className="text-xs text-blue-600 hover:underline">Clear</button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ride</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Driver</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Goods</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Revenue</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicleTrips.map(t => {
              const tripDriver = drivers.find(d => d.driverId === t.driverId)
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 text-xs">
                      {(t.originCustomer || tripOrigin(t) || 'Origin')} to {(t.destCustomer || tripDest(t) || 'Destination')}
                    </p>
                    <p className="text-xs text-gray-400">{tripOrigin(t)} to {tripDest(t)}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    {tripDriver ? (
                      <div className="flex items-center gap-2">
                        <Avatar src={tripDriver.avatar} name={tripDriver.name} size="sm" color="emerald" />
                        <div>
                          <p className="text-xs font-medium text-gray-800">{tripDriver.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{tripDriver.driverId}</p>
                        </div>
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <p className="text-xs font-medium text-gray-800">{t.commodity || '—'}</p>
                    <p className="text-xs text-gray-400">{t.tons ? `${t.tons} tons` : '—'}</p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-right font-medium text-gray-900">
                    {fmt(tripRevenue(t))}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status]}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )
            })}
            {vehicleTrips.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No rides found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const VEHICLE_TYPES = ['Truck', 'Van', 'Pickup', 'Tanker', 'Trailer', 'Bus']
const MAKES = ['Tata', 'Mahindra', 'Ashok Leyland', 'Eicher', 'BharatBenz', 'Other']
const TYPES = ['Heavy', 'Medium', 'Light']

function docStatus(expiry) {
  if (isExpired(expiry)) return 'expired'
  if (isExpiringSoon(expiry)) return 'expiring'
  return 'active'
}

function DocBadge({ label, expiry }) {
  const status = docStatus(expiry)
  const colors = {
    active: 'text-green-600 bg-green-50 border-green-200',
    expiring: 'text-amber-600 bg-amber-50 border-amber-200',
    expired: 'text-red-600 bg-red-50 border-red-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${colors[status]}`}>
      <FileText size={11} /> {label}: {expiry}
    </span>
  )
}

const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function normalizeVehicleNumber(value) {
  return (value || '').toUpperCase().replace(/\s+/g, '')
}

function VehicleForm({ onSave, onClose, existing }) {
  const [form, setForm] = useState(existing || {
    vehicleNumber: '', vehicleType: '', make: '', type: '',
    status: 'active',
    insurance: { expiry: '' },
    pollution: { expiry: '' },
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setNested = (parent, k, v) => setForm(f => ({ ...f, [parent]: { ...f[parent], [k]: v } }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number *</label>
          <input required value={form.vehicleNumber} onChange={e => set('vehicleNumber', normalizeVehicleNumber(e.target.value))}
            placeholder="MH12AB1234" className={`${fieldCls} uppercase`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type *</label>
          <select required value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} className={fieldCls}>
            <option value="">Select</option>
            {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Make *</label>
          <select required value={form.make} onChange={e => set('make', e.target.value)} className={fieldCls}>
            <option value="">Select</option>
            {MAKES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
          <select required value={form.type} onChange={e => set('type', e.target.value)} className={fieldCls}>
            <option value="">Select</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldCls}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Documents</p>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">RC Card</label>
        <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50">
          <Upload size={14} className="text-gray-400" />
          <span className="text-sm text-gray-400">Upload RC card PDF / image</span>
          <input type="file" accept=".pdf,image/*" className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Expiry *</label>
          <input type="date" required value={form.insurance.expiry}
            onChange={e => setNested('insurance', 'expiry', e.target.value)} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Upload Insurance</label>
          <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-[38px]">
            <Upload size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">PDF / image</span>
            <input type="file" accept=".pdf,image/*" className="hidden" />
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Pollution Cert Expiry *</label>
          <input type="date" required value={form.pollution.expiry}
            onChange={e => setNested('pollution', 'expiry', e.target.value)} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Upload Pollution Cert</label>
          <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-[38px]">
            <Upload size={13} className="text-gray-400" />
            <span className="text-xs text-gray-400">PDF / image</span>
            <input type="file" accept=".pdf,image/*" className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          {existing ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  )
}

function VehiclesTable({ vehicles, drivers, label, onView, onEdit, onToggle, onDeassign }) {
  if (vehicles.length === 0) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">{vehicles.length}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle No.</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Make / Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Documents</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vehicles.map(v => {
            const driver = drivers.find(d => d.driverId === v.assignedDriver)
            return (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{v.vehicleNumber}</p>
                  <p className="text-xs text-gray-400">{v.vehicleType}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-gray-700">{v.make}</p>
                  <p className="text-xs text-gray-400">{v.type}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    <DocBadge label="Ins" expiry={v.insurance.expiry} />
                    <DocBadge label="PUC" expiry={v.pollution.expiry} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {driver ? (
                    <div className="flex items-center gap-2">
                      <Avatar src={driver.avatar} name={driver.name} size="sm" color="emerald" />
                      <div>
                        <p className="text-xs font-medium text-gray-800">{driver.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{driver.driverId}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3"><Badge status={v.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onView(v)} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 font-medium">
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => onEdit(v)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    {v.assignedDriver && (
                      <button onClick={() => onDeassign(v.assignedDriver)}
                        className="text-xs text-red-500 hover:underline">Deassign</button>
                    )}
                    <button onClick={() => onToggle(v.id)} className="text-xs text-gray-400 hover:underline">
                      {v.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function Vehicles() {
  const { vehicles, drivers, trips, createVehicle, updateVehicle, deassignVehicle } = useData()
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const searchText = search.toLowerCase()
  const normalizedSearch = normalizeVehicleNumber(search)
  const filtered = vehicles.filter(v =>
    normalizeVehicleNumber(v.vehicleNumber).includes(normalizedSearch) ||
    (v.make || '').toLowerCase().includes(searchText)
  )

  const assigned = filtered.filter(v => v.assignedDriver)
  const unassigned = filtered.filter(v => !v.assignedDriver)

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
  }

  const handleSave = async (form) => {
    const normalizedForm = { ...form, vehicleNumber: normalizeVehicleNumber(form.vehicleNumber) }
    const isDup = vehicles.some(v =>
      normalizeVehicleNumber(v.vehicleNumber) === normalizedForm.vehicleNumber && v.id !== editing?.id
    )
    if (isDup) { alert('Vehicle number already exists'); return }

    try {
      if (editing) {
        await updateVehicle(editing.id, normalizedForm)
      } else {
        await createVehicle(normalizedForm)
      }
      closeModal()
    } catch (err) {
      alert(err.message || 'Failed to save vehicle')
    }
  }

  const toggleStatus = async (id) => {
    const v = vehicles.find(v => v.id === id)
    if (!v) return
    try {
      await updateVehicle(id, { status: v.status === 'active' ? 'inactive' : 'active' })
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  if (view === 'detail' && selected) {
    const live = vehicles.find(v => v.id === selected.id) || selected
    return (
      <>
        <VehicleDetail
          vehicle={live}
          drivers={drivers}
          trips={trips}
          onBack={() => setView('list')}
          onEdit={() => { setEditing(live); setShowModal(true) }}
        />
        {showModal && (
          <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={closeModal}>
            <VehicleForm onSave={handleSave} onClose={closeModal} existing={editing} />
          </Modal>
        )}
      </>
    )
  }

  const tableProps = {
    drivers,
    onView: (v) => { setSelected(v); setView('detail') },
    onEdit: (v) => { setEditing(v); setShowModal(true) },
    onToggle: toggleStatus,
    onDeassign: (driverId) => deassignVehicle(driverId),
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} registered · {assigned.length} assigned</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by vehicle number or make..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <VehiclesTable {...tableProps} vehicles={assigned} label="Assigned" />
      <VehiclesTable {...tableProps} vehicles={unassigned} label="Unassigned" />

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-10 text-center text-gray-400 text-sm">
          No vehicles found
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={closeModal}>
          <VehicleForm onSave={handleSave} onClose={closeModal} existing={editing} />
        </Modal>
      )}
    </div>
  )
}
