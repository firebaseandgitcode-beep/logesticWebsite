import { useState, useRef } from 'react'
import { Plus, Search, ArrowLeft, Eye, Camera, X, Truck } from 'lucide-react'
import {
  tripRevenue, tripOrigin, tripDest, tripDriverSalary, tripDriverAdvance,
  tripDriverDue, tripDriverPaid,
} from '../data/store'
import { useData } from '../context/DataContext'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// ─── Assign Vehicle Modal ─────────────────────────────────────────────────────

function AssignVehicleModal({ driver, vehicles, onAssign, onClose }) {
  const [q, setQ] = useState('')
  const available = vehicles.filter(v =>
    v.status === 'active' &&
    (!v.assignedDriver || v.assignedDriver === driver.driverId) &&
    v.vehicleNumber.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Assigning vehicle to <span className="font-semibold">{driver.name}</span>
      </p>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search vehicle number..."
          autoFocus
          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {available.map(v => (
          <button key={v.id} onClick={() => onAssign(v.vehicleNumber)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors
              ${v.assignedDriver === driver.driverId
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'}`}>
            <Truck size={16} className="text-gray-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{v.vehicleNumber}</p>
              <p className="text-xs text-gray-400">{v.make} · {v.vehicleType} · {v.type}</p>
            </div>
            {v.assignedDriver === driver.driverId && (
              <span className="text-xs text-blue-600 font-medium">Current</span>
            )}
          </button>
        ))}
        {available.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">No available vehicles found</p>
        )}
      </div>
      <button onClick={onClose}
        className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
        Cancel
      </button>
    </div>
  )
}

// ─── Driver Form ──────────────────────────────────────────────────────────────

function DriverForm({ onSave, onClose, existing, nextId }) {
  const avatarRef = useRef()
  const [form, setForm] = useState(existing || {
    avatar: null, name: '', phone: '', email: '', licence: '',
    bankDetails: { bank: '', account: '', ifsc: '' },
    status: 'active',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setBank = (k, v) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [k]: v } }))

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('avatar', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form) }} className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={form.avatar} name={form.name || 'New'} size="xl" color="emerald" />
          <button type="button" onClick={() => avatarRef.current.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow hover:bg-gray-50">
            <Camera size={13} className="text-gray-600" />
          </button>
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-0.5">Click camera icon to upload</p>
          {!existing && (
            <span className="inline-block mt-1 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {nextId}
            </span>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className={fieldCls} placeholder="Ramesh Kumar" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input required value={form.phone} onChange={e => set('phone', e.target.value)} className={fieldCls} maxLength={10} placeholder="9876543210" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldCls}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={fieldCls} placeholder="ramesh@example.com" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Licence Number *</label>
          <input required value={form.licence} onChange={e => set('licence', e.target.value.toUpperCase())}
            className={`${fieldCls} uppercase`} placeholder="MH-1420230012345" />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bank Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
            <input value={form.bankDetails.bank} onChange={e => setBank('bank', e.target.value)} className={fieldCls} placeholder="SBI" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account No.</label>
            <input value={form.bankDetails.account} onChange={e => setBank('account', e.target.value)} className={fieldCls} placeholder="1234567890" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">IFSC</label>
            <input value={form.bankDetails.ifsc} onChange={e => setBank('ifsc', e.target.value.toUpperCase())}
              className={`${fieldCls} uppercase`} placeholder="SBIN0001234" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          {existing ? 'Update Driver' : 'Add Driver'}
        </button>
      </div>
    </form>
  )
}

// ─── Driver Detail View ───────────────────────────────────────────────────────

function DriverDetail({ driver, trips, vehicles, onBack, onEdit, onAssign, onDeassign, onMarkDuePaid }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showAssign, setShowAssign] = useState(false)

  const assignedVehicle = vehicles.find(v => v.vehicleNumber === driver.assignedVehicle)

  const driverTrips = trips.filter(t => {
    if (t.driverId !== driver.driverId) return false
    if (from && t.date < from) return false
    if (to && t.date > to) return false
    return true
  })
  const totalSalary = driverTrips.reduce((sum, trip) => sum + tripDriverSalary(trip), 0)
  const totalPaid = driverTrips.reduce((sum, trip) => sum + tripDriverPaid(trip), 0)
  const totalDue = driverTrips.reduce((sum, trip) => sum + tripDriverDue(trip), 0)

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

  const statusStyle = {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    planned: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Drivers
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Edit Driver
        </button>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar src={driver.avatar} name={driver.name} size="xl" color="emerald" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{driver.name}</h2>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{driver.driverId}</p>
              </div>
              <Badge status={driver.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium text-gray-800">{driver.phone}</p></div>
              <div><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-800 truncate">{driver.email || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Licence</p><p className="font-mono text-gray-800 text-xs">{driver.licence}</p></div>
              <div><p className="text-xs text-gray-400">Bank</p><p className="font-medium text-gray-800">{driver.bankDetails.bank || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Account</p><p className="font-medium text-gray-800">{driver.bankDetails.account || '—'}</p></div>
              <div><p className="text-xs text-gray-400">IFSC</p><p className="font-mono text-gray-800 text-xs">{driver.bankDetails.ifsc || '—'}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Vehicle */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Assigned Vehicle</h3>
          {assignedVehicle
            ? <button onClick={onDeassign}
                className="text-xs text-red-500 hover:underline font-medium">Deassign</button>
            : <button onClick={() => setShowAssign(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                <Plus size={12} /> Assign Vehicle
              </button>
          }
        </div>
        {assignedVehicle ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{assignedVehicle.vehicleNumber}</p>
              <p className="text-xs text-gray-500">{assignedVehicle.make} · {assignedVehicle.vehicleType} · {assignedVehicle.type}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No vehicle assigned</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Earning', value: fmt(totalSalary), cls: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Paid', value: fmt(totalPaid), cls: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Due', value: fmt(totalDue), cls: totalDue > 0 ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-700 bg-gray-50 border-gray-200' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.cls}`}>
            <p className="text-xs opacity-70">{card.label}</p>
            <p className="text-lg font-bold mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Trip History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Trip History</h3>
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Vehicle</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Salary</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Advance</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {driverTrips.map(t => {
              const due = tripDriverDue(t)
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900 text-xs">{tripOrigin(t)}</p>
                    <p className="text-xs text-gray-400">{tripDest(t)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.commodity || '—'} · Revenue {fmt(tripRevenue(t))}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="font-mono text-xs text-gray-600">{t.vehicleNumber || '—'}</span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-right font-medium text-gray-900">
                    {fmt(tripDriverSalary(t))}
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell text-right font-medium text-gray-600">
                    {fmt(tripDriverAdvance(t))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <p className={`text-sm font-semibold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(due)}</p>
                    {due > 0 ? (
                      <button onClick={() => onMarkDuePaid(t)}
                        className="mt-1 text-xs text-blue-600 hover:underline font-medium">
                        Mark due paid
                      </button>
                    ) : (
                      <span className="text-xs text-green-600">Paid</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusStyle[t.status]}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              )
            })}
            {driverTrips.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">No trips found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAssign && (
        <Modal title="Assign Vehicle" onClose={() => setShowAssign(false)}>
          <AssignVehicleModal
            driver={driver}
            vehicles={vehicles}
            onAssign={(vNum) => { onAssign(driver.driverId, vNum); setShowAssign(false) }}
            onClose={() => setShowAssign(false)}
          />
        </Modal>
      )}
    </div>
  )
}

// ─── Drivers Table ────────────────────────────────────────────────────────────

function DriversTable({ drivers, vehicles, label, onView, onEdit, onToggle, onAssignOpen, onDeassign }) {
  if (drivers.length === 0) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</span>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">{drivers.length}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Licence</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {drivers.map(d => {
            const veh = vehicles.find(v => v.vehicleNumber === d.assignedVehicle)
            return (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={d.avatar} name={d.name} size="sm" color="emerald" />
                    <div>
                      <p className="font-semibold text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{d.driverId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{d.phone}</td>
                <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-gray-600">{d.licence}</td>
                <td className="px-4 py-3">
                  {veh ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Truck size={11} /> {veh.vehicleNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3"><Badge status={d.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => onView(d)} className="text-xs text-gray-600 hover:text-blue-600 font-medium">View</button>
                    <button onClick={() => onEdit(d)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    {d.assignedVehicle
                      ? <button onClick={() => onDeassign(d.driverId)} className="text-xs text-red-500 hover:underline">Deassign</button>
                      : <button onClick={() => onAssignOpen(d)} className="text-xs text-violet-600 hover:underline">Assign</button>
                    }
                    <button onClick={() => onToggle(d.id)} className="text-xs text-gray-400 hover:underline">
                      {d.status === 'active' ? 'Deactivate' : 'Activate'}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Drivers() {
  const { drivers, vehicles, trips, createDriver, updateDriver, assignVehicle, deassignVehicle, updateTrip } = useData()
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)

  const searchText = search.toLowerCase()
  const filtered = drivers.filter(d =>
    (d.name || '').toLowerCase().includes(searchText) ||
    (d.driverId || '').toLowerCase().includes(searchText) ||
    (d.phone || '').includes(search)
  )

  const assigned = filtered.filter(d => d.assignedVehicle)
  const unassigned = filtered.filter(d => !d.assignedVehicle)

  const handleSave = async (form) => {
    try {
      if (editing) {
        await updateDriver(editing.id, form)
      } else {
        await createDriver(form)
      }
      setShowModal(false)
      setEditing(null)
    } catch (err) {
      alert(err.message || 'Failed to save driver')
    }
  }

  const toggleStatus = async (id) => {
    const d = drivers.find(d => d.id === id)
    if (!d) return
    try {
      await updateDriver(id, { status: d.status === 'active' ? 'inactive' : 'active' })
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  const markDuePaid = async (trip) => {
    const due = tripDriverDue(trip)
    if (due <= 0) return
    try {
      await updateTrip(trip.id, {
        driverPayment: {
          ...(trip.driverPayment || {}),
          duePaid: true,
          duePaidAt: new Date().toISOString(),
        },
      })
    } catch (err) {
      alert(err.message || 'Failed to mark due paid')
    }
  }

  if (view === 'detail' && selected) {
    const live = drivers.find(d => d.id === selected.id) || selected
    return (
      <>
        <DriverDetail
          driver={live}
          trips={trips}
          vehicles={vehicles}
          onBack={() => setView('list')}
          onEdit={() => { setEditing(live); setShowModal(true) }}
          onAssign={(driverId, vehicleNumber) => assignVehicle(driverId, vehicleNumber)}
          onDeassign={() => deassignVehicle(live.driverId)}
          onMarkDuePaid={markDuePaid}
        />
        {showModal && (
          <Modal title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => { setShowModal(false); setEditing(null) }}>
            <DriverForm onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }}
              existing={editing} nextId="Auto-generated" />
          </Modal>
        )}
      </>
    )
  }

  const tableProps = {
    vehicles,
    onView: (d) => { setSelected(d); setView('detail') },
    onEdit: (d) => { setEditing(d); setShowModal(true) },
    onToggle: toggleStatus,
    onAssignOpen: (d) => setAssignTarget(d),
    onDeassign: (driverId) => deassignVehicle(driverId),
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} registered · {assigned.length} assigned</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Driver
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID or phone..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <DriversTable {...tableProps} drivers={assigned} label="Assigned" />
      <DriversTable {...tableProps} drivers={unassigned} label="Unassigned" />

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-10 text-center text-gray-400 text-sm">
          No drivers found
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <DriverForm onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }}
            existing={editing} nextId="Auto-generated" />
        </Modal>
      )}

      {assignTarget && (
        <Modal title="Assign Vehicle" onClose={() => setAssignTarget(null)}>
          <AssignVehicleModal
            driver={assignTarget}
            vehicles={vehicles}
            onAssign={(vNum) => { assignVehicle(assignTarget.driverId, vNum); setAssignTarget(null) }}
            onClose={() => setAssignTarget(null)}
          />
        </Modal>
      )}
    </div>
  )
}
