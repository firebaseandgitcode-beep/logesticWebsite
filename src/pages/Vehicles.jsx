import { useState } from 'react'
import { Plus, Search, Upload, FileText } from 'lucide-react'
import { initialVehicles, isExpired, isExpiringSoon } from '../data/store'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

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

function VehicleForm({ onSave, onClose, existing }) {
  const [form, setForm] = useState(existing || {
    vehicleNumber: '', vehicleType: '', make: '', type: '',
    status: 'active',
    insurance: { expiry: '' },
    pollution: { expiry: '' },
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setNested = (parent, key, val) => setForm(f => ({ ...f, [parent]: { ...f[parent], [key]: val } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Number *</label>
          <input
            required
            value={form.vehicleNumber}
            onChange={e => set('vehicleNumber', e.target.value.toUpperCase())}
            placeholder="MH12AB1234"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type *</label>
          <select required value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select</option>
            {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Make *</label>
          <select required value={form.make} onChange={e => set('make', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select</option>
            {MAKES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
          <select required value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Documents</p>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">RC Card</label>
          <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition">
            <Upload size={14} className="text-gray-400" />
            <span className="text-sm text-gray-400">Upload RC card PDF / image</span>
            <input type="file" accept=".pdf,image/*" className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Insurance Expiry *</label>
            <input type="date" required value={form.insurance.expiry}
              onChange={e => setNested('insurance', 'expiry', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Upload Insurance</label>
            <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 h-[38px]">
              <Upload size={13} className="text-gray-400" />
              <span className="text-xs text-gray-400">PDF / image</span>
              <input type="file" accept=".pdf,image/*" className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pollution Cert Expiry *</label>
            <input type="date" required value={form.pollution.expiry}
              onChange={e => setNested('pollution', 'expiry', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          {existing ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  )
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = vehicles.filter(v =>
    v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (form) => {
    if (editing) {
      setVehicles(vs => vs.map(v => v.id === editing.id ? { ...v, ...form } : v))
    } else {
      const isDup = vehicles.some(v => v.vehicleNumber === form.vehicleNumber)
      if (isDup) { alert('Vehicle number already exists'); return }
      setVehicles(vs => [...vs, { ...form, id: Date.now() }])
    }
    setShowModal(false)
    setEditing(null)
  }

  const toggleStatus = (id) => {
    setVehicles(vs => vs.map(v => v.id === id ? { ...v, status: v.status === 'active' ? 'inactive' : 'active' } : v))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} registered</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by vehicle number or make..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Make / Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Documents</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(v => (
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
                    <DocBadge label="Insurance" expiry={v.insurance.expiry} />
                    <DocBadge label="Pollution" expiry={v.pollution.expiry} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge status={v.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(v); setShowModal(true) }}
                      className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => toggleStatus(v.id)}
                      className="text-xs text-gray-500 hover:underline">
                      {v.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <VehicleForm onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null) }} existing={editing} />
        </Modal>
      )}
    </div>
  )
}
