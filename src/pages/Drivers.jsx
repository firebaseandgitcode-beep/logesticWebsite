import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { initialDrivers, generateDriverId } from '../data/store'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

function DriverForm({ onSave, onClose, existing, nextId }) {
  const [form, setForm] = useState(existing || {
    name: '', phone: '', licence: '',
    bankDetails: { account: '', ifsc: '', bank: '' },
    status: 'active',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setBank = (key, val) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [key]: val } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!existing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">Auto-assigned Driver ID:</span>
          <span className="text-sm font-bold text-blue-700">{nextId}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="Ramesh Kumar"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
          <input required value={form.phone} onChange={e => set('phone', e.target.value)}
            placeholder="9876543210" maxLength={10}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Licence Number *</label>
          <input required value={form.licence} onChange={e => set('licence', e.target.value.toUpperCase())}
            placeholder="MH-1420230012345"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bank Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
            <input value={form.bankDetails.bank} onChange={e => setBank('bank', e.target.value)}
              placeholder="SBI"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Account Number</label>
            <input value={form.bankDetails.account} onChange={e => setBank('account', e.target.value)}
              placeholder="1234567890"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code</label>
            <input value={form.bankDetails.ifsc} onChange={e => setBank('ifsc', e.target.value.toUpperCase())}
              placeholder="SBIN0001234"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
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
          {existing ? 'Update Driver' : 'Add Driver'}
        </button>
      </div>
    </form>
  )
}

export default function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.driverId.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  )

  const handleSave = (form) => {
    if (editing) {
      setDrivers(ds => ds.map(d => d.id === editing.id ? { ...d, ...form } : d))
    } else {
      const newId = generateDriverId(drivers)
      setDrivers(ds => [...ds, { ...form, id: Date.now(), driverId: newId }])
    }
    setShowModal(false)
    setEditing(null)
  }

  const toggleStatus = (id) => {
    setDrivers(ds => ds.map(d => d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} registered</p>
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Licence</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Bank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{d.driverId}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{d.phone}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="font-mono text-xs text-gray-600">{d.licence}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-gray-600">{d.bankDetails.bank}</p>
                  <p className="text-xs text-gray-400">{d.bankDetails.account}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge status={d.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(d); setShowModal(true) }}
                      className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => toggleStatus(d.id)}
                      className="text-xs text-gray-500 hover:underline">
                      {d.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No drivers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => { setShowModal(false); setEditing(null) }}>
          <DriverForm
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null) }}
            existing={editing}
            nextId={generateDriverId(drivers)}
          />
        </Modal>
      )}
    </div>
  )
}
