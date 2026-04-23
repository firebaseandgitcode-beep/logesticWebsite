import { createElement, useState, useMemo, useRef } from 'react'
import { Plus, Search, ArrowLeft, Eye, Pencil, Trash2, Upload, CheckCircle2,
  Fuel, Truck, DollarSign, TrendingUp, Route, Package, ChevronDown, FileText } from 'lucide-react'
import {
  tripRevenue, tripFuelCost, tripAllExpenses, tripNetPay, tripOrigin, tripDest, tripStatus,
  tripDriverSalary,
} from '../data/store'
import { useData } from '../context/DataContext'
import Badge from '../components/Badge'
import Avatar from '../components/Avatar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)
const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

const TIME_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
  { label: 'Today', value: 'today' },
]

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  planned: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-600',
}
const statusLabel = (s) => ({ completed: 'Completed', in_progress: 'In Progress', planned: 'Planned', cancelled: 'Cancelled' }[s] || s)

function filterByTime(trips, filter) {
  const now = new Date()
  return trips.filter(t => {
    const d = new Date(t.date)
    if (filter === 'today') return d.toDateString() === now.toDateString()
    if (filter === 'week') { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); s.setHours(0,0,0,0); return d >= s }
    if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })
}

function emptyTrip() {
  return {
    date: '', originCustomer: '', originCity: '', originState: '',
    destCustomer: '', destCity: '', destState: '',
    commodity: '', tons: '',
    driverId: '', vehicleNumber: '',
    documents: [], notes: '', verifiedCreate: false,
    otherExpenses: [], driverPayment: { totalAmount: '', advance: '', duePaid: false, duePaidAt: null },
    fuelEntries: [], fuelVerified: false,
    rateType: 'freight', costPerTon: '', flatAmount: '',
    tollExpense: '', managedExpenses: [],
    verifiedManage: false, verifiedTripDetails: false, verifiedFuelDetails: false,
  }
}

function normalizeTrip(trip) {
  const base = emptyTrip()
  return {
    ...base,
    ...trip,
    documents: trip?.documents || [],
    otherExpenses: trip?.otherExpenses || [],
    fuelEntries: trip?.fuelEntries || [],
    managedExpenses: trip?.managedExpenses || [],
    driverPayment: { ...base.driverPayment, ...(trip?.driverPayment || {}) },
  }
}

function isImageData(value) {
  return typeof value === 'string' && value.startsWith('data:image')
}

function AttachmentPreview({ value, label }) {
  if (!value) return <span className="text-xs text-gray-400">Not uploaded</span>

  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-blue-300 transition"
    >
      {isImageData(value) ? (
        <img src={value} alt={label} className="h-10 w-10 rounded-md object-cover bg-gray-100" />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-gray-500">
          <FileText size={16} />
        </span>
      )}
      <span className="text-xs font-medium text-blue-600">{label}</span>
    </a>
  )
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-200 shrink-0">
      {tabs.map((t, i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            active === i ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
            active === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
          {t}
        </button>
      ))}
    </div>
  )
}

// ─── Dynamic list helpers ─────────────────────────────────────────────────────

function addItem(list, template) { return [...list, { ...template, id: Date.now() + Math.random() }] }
function removeItem(list, id) { return list.filter(x => x.id !== id) }
function updateItem(list, id, key, val) { return list.map(x => x.id === id ? { ...x, [key]: val } : x) }

// ─── Image upload helper ──────────────────────────────────────────────────────

function ImageUploadBtn({ value, onChange, label = 'Upload image' }) {
  const ref = useRef()
  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return
    const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f)
  }
  return (
    <label className={`flex items-center gap-2 border border-dashed rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 transition ${value ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
      <Upload size={13} className={value ? 'text-green-600' : 'text-gray-400'} />
      <span className={`text-xs ${value ? 'text-green-700' : 'text-gray-400'}`}>{value ? 'Image uploaded' : label}</span>
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
    </label>
  )
}

// ─── Part 1: Create Trip Tab ──────────────────────────────────────────────────

function CreateTripTab({ form, set, drivers, vehicles }) {
  const balance = (Number(form.driverPayment.totalAmount) || 0) - (Number(form.driverPayment.advance) || 0)
  const selectedDriver = drivers.find(d => d.driverId === form.driverId)
  const selectedVehicle = vehicles.find(v => v.vehicleNumber === form.vehicleNumber)
  const driverOptions = drivers.filter(d => d.status === 'active' || d.driverId === form.driverId)
  const vehicleOptions = vehicles.filter(v => v.status === 'active' || v.vehicleNumber === form.vehicleNumber)

  const handleDriverChange = (driverId) => {
    set('driverId', driverId)
    if (!driverId) {
      set('vehicleNumber', '')
      return
    }

    const driver = drivers.find(d => d.driverId === driverId)
    if (driver?.assignedVehicle) set('vehicleNumber', driver.assignedVehicle)
  }

  const handleVehicleChange = (vehicleNumber) => {
    set('vehicleNumber', vehicleNumber)
    if (!vehicleNumber) return

    const vehicle = vehicles.find(v => v.vehicleNumber === vehicleNumber)
    if (vehicle?.assignedDriver) set('driverId', vehicle.assignedDriver)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
        <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className={fieldCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Origin</div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
          <input required value={form.originCustomer} onChange={e => set('originCustomer', e.target.value)} className={fieldCls} placeholder="ABC Traders" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
          <input required value={form.originCity} onChange={e => set('originCity', e.target.value)} className={fieldCls} placeholder="Mumbai" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
          <input required value={form.originState} onChange={e => set('originState', e.target.value)} className={fieldCls} placeholder="MH" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Destination</div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
          <input required value={form.destCustomer} onChange={e => set('destCustomer', e.target.value)} className={fieldCls} placeholder="XYZ Ltd" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
          <input required value={form.destCity} onChange={e => set('destCity', e.target.value)} className={fieldCls} placeholder="Pune" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">State *</label>
          <input required value={form.destState} onChange={e => set('destState', e.target.value)} className={fieldCls} placeholder="MH" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Commodity / Goods *</label>
          <input required value={form.commodity} onChange={e => set('commodity', e.target.value)} className={fieldCls} placeholder="Electronics" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tons *</label>
          <input required type="number" min="0" step="0.1" value={form.tons} onChange={e => set('tons', e.target.value)} className={fieldCls} placeholder="5" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Assigned Driver</label>
          <select value={form.driverId} onChange={e => handleDriverChange(e.target.value)} className={fieldCls}>
            <option value="">— Select Driver —</option>
            {driverOptions.map(d => (
              <option key={d.driverId} value={d.driverId}>{d.name} ({d.driverId})</option>
            ))}
          </select>
          {selectedDriver?.assignedVehicle && (
            <p className="mt-1 text-xs text-blue-600">
              Auto-filled vehicle from current assignment: {selectedDriver.assignedVehicle}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Number</label>
          <select value={form.vehicleNumber} onChange={e => handleVehicleChange(e.target.value)} className={fieldCls}>
            <option value="">— Select Vehicle —</option>
            {vehicleOptions.map(v => (
              <option key={v.vehicleNumber} value={v.vehicleNumber}>
                {v.vehicleNumber} ({v.make} · {v.vehicleType})
              </option>
            ))}
          </select>
          {selectedVehicle?.assignedDriver && (
            <p className="mt-1 text-xs text-blue-600">
              Auto-filled driver from current assignment: {selectedVehicle.assignedDriver}
            </p>
          )}
        </div>
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Documents</label>
          <button type="button" onClick={() => set('documents', addItem(form.documents, { description: '', image: null }))}
            className="text-xs text-blue-600 hover:underline font-medium">+ Add Document</button>
        </div>
        {form.documents.map(doc => (
          <div key={doc.id} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input value={doc.description} onChange={e => set('documents', updateItem(form.documents, doc.id, 'description', e.target.value))}
              placeholder="Document description" className={fieldCls} />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ImageUploadBtn value={doc.image} onChange={v => set('documents', updateItem(form.documents, doc.id, 'image', v))} label="Upload image" />
              </div>
              <button type="button" onClick={() => set('documents', removeItem(form.documents, doc.id))}
                className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
          placeholder="Any trip related notes..." className={`${fieldCls} resize-none`} />
      </div>

      {/* Other Expenses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Other Expenses</label>
          <button type="button" onClick={() => set('otherExpenses', addItem(form.otherExpenses, { type: '', amount: '', billImage: null, description: '' }))}
            className="text-xs text-blue-600 hover:underline font-medium">+ Add Expense</button>
        </div>
        {form.otherExpenses.map(ex => (
          <div key={ex.id} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input value={ex.type} onChange={e => set('otherExpenses', updateItem(form.otherExpenses, ex.id, 'type', e.target.value))}
              placeholder="Type (e.g. Loading)" className={fieldCls} />
            <input type="number" min="0" value={ex.amount} onChange={e => set('otherExpenses', updateItem(form.otherExpenses, ex.id, 'amount', e.target.value))}
              placeholder="Amount ₹" className={fieldCls} />
            <input value={ex.description} onChange={e => set('otherExpenses', updateItem(form.otherExpenses, ex.id, 'description', e.target.value))}
              placeholder="Description" className={fieldCls} />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ImageUploadBtn value={ex.billImage} onChange={v => set('otherExpenses', updateItem(form.otherExpenses, ex.id, 'billImage', v))} label="Bill (optional)" />
              </div>
              <button type="button" onClick={() => set('otherExpenses', removeItem(form.otherExpenses, ex.id))}
                className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Driver Payment */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Driver Payment</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount (₹)</label>
            <input type="number" min="0" value={form.driverPayment.totalAmount}
              onChange={e => set('driverPayment', { ...form.driverPayment, totalAmount: e.target.value })}
              className={fieldCls} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Advance (₹)</label>
            <input type="number" min="0" value={form.driverPayment.advance}
              onChange={e => set('driverPayment', { ...form.driverPayment, advance: e.target.value })}
              className={fieldCls} placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Balance (₹)</label>
            <div className={`${fieldCls} bg-gray-100 font-semibold ${balance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
              {fmt(balance)}
            </div>
          </div>
        </div>
      </div>

      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${form.verifiedCreate ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
        <input type="checkbox" checked={form.verifiedCreate} onChange={e => set('verifiedCreate', e.target.checked)} className="accent-green-600 w-4 h-4" />
        <span className="text-sm font-medium text-gray-700">I have thoroughly verified all the details</span>
        {form.verifiedCreate && <CheckCircle2 size={16} className="text-green-600 ml-auto" />}
      </label>
    </div>
  )
}

// ─── Part 2: Fuel Details Tab ─────────────────────────────────────────────────

function FuelDetailsTab({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Fuel Entries ({form.fuelEntries.length})
        </p>
        <button type="button"
          onClick={() => set('fuelEntries', addItem(form.fuelEntries, { date: '', odometer: '', litres: '', perLtrCost: '', billImage: null }))}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
          <Plus size={12} /> Add Fuel Entry
        </button>
      </div>

      {form.fuelEntries.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
          No fuel entries yet. Click "Add Fuel Entry" to start.
        </div>
      )}

      {form.fuelEntries.map((f, idx) => {
        const total = (Number(f.litres) || 0) * (Number(f.perLtrCost) || 0)
        return (
          <div key={f.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Entry {idx + 1}</span>
              <div className="flex items-center gap-3">
                {total > 0 && <span className="text-xs font-bold text-orange-600">{fmt(total)}</span>}
                <button type="button" onClick={() => set('fuelEntries', removeItem(form.fuelEntries, f.id))}
                  className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
                <input type="date" required value={f.date}
                  onChange={e => set('fuelEntries', updateItem(form.fuelEntries, f.id, 'date', e.target.value))} className={fieldCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Odometer (km) *</label>
                <input type="number" min="0" required value={f.odometer}
                  onChange={e => set('fuelEntries', updateItem(form.fuelEntries, f.id, 'odometer', e.target.value))} className={fieldCls} placeholder="45000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fuel (litres) *</label>
                <input type="number" min="0" step="0.1" required value={f.litres}
                  onChange={e => set('fuelEntries', updateItem(form.fuelEntries, f.id, 'litres', e.target.value))} className={fieldCls} placeholder="40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Per Litre Cost (₹) *</label>
                <input type="number" min="0" step="0.01" required value={f.perLtrCost}
                  onChange={e => set('fuelEntries', updateItem(form.fuelEntries, f.id, 'perLtrCost', e.target.value))} className={fieldCls} placeholder="105" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Bill Image</label>
                <ImageUploadBtn value={f.billImage} onChange={v => set('fuelEntries', updateItem(form.fuelEntries, f.id, 'billImage', v))} label="Upload fuel bill" />
              </div>
            </div>
          </div>
        )
      })}

      {form.fuelEntries.length > 0 && (
        <div className="flex items-center justify-end p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-xs text-orange-600 font-medium mr-2">Total Fuel Cost:</span>
          <span className="text-sm font-bold text-orange-700">
            {fmt(form.fuelEntries.reduce((s, f) => s + (Number(f.litres) || 0) * (Number(f.perLtrCost) || 0), 0))}
          </span>
        </div>
      )}

      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${form.fuelVerified ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
        <input type="checkbox" checked={form.fuelVerified} onChange={e => set('fuelVerified', e.target.checked)} className="accent-green-600 w-4 h-4" />
        <span className="text-sm font-medium text-gray-700">I have thoroughly verified all the details</span>
        {form.fuelVerified && <CheckCircle2 size={16} className="text-green-600 ml-auto" />}
      </label>
    </div>
  )
}

// ─── Part 3: Manage Trip Tab ──────────────────────────────────────────────────

function ManageTripTab({ form, set }) {
  const revenue = form.rateType === 'flat'
    ? Number(form.flatAmount) || 0
    : (Number(form.tons) || 0) * (Number(form.costPerTon) || 0)

  const allVerified =
    form.verifiedCreate &&
    form.fuelVerified &&
    form.verifiedManage &&
    form.verifiedTripDetails &&
    form.verifiedFuelDetails

  return (
    <div className="space-y-5">
      {/* Rate type */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Rate Type *</label>
        <div className="flex gap-4">
          {[['freight', 'Freight Rate (per ton)'], ['flat', 'Flat Rate (full amount)']].map(([val, lbl]) => (
            <label key={val} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${form.rateType === val ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="rateType" value={val} checked={form.rateType === val} onChange={() => set('rateType', val)} className="accent-blue-600" />
              <span className="text-sm font-medium">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {form.rateType === 'freight' ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cost per Ton (₹) *</label>
            <input type="number" min="0" required value={form.costPerTon}
              onChange={e => set('costPerTon', e.target.value)} className={fieldCls} placeholder="800" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tons</label>
            <div className={`${fieldCls} bg-gray-100 text-gray-600`}>{form.tons || '—'}</div>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Flat Amount (₹) *</label>
          <input type="number" min="0" required value={form.flatAmount}
            onChange={e => set('flatAmount', e.target.value)} className={fieldCls} placeholder="10000" />
        </div>
      )}

      {revenue > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-medium">Estimated Revenue</span>
          <span className="text-sm font-bold text-emerald-700">{fmt(revenue)}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Toll Expense (₹)</label>
        <input type="number" min="0" value={form.tollExpense} onChange={e => set('tollExpense', e.target.value)}
          className={fieldCls} placeholder="0" />
      </div>

      {/* Managed Other Expenses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Other Expenses</label>
          <button type="button" onClick={() => set('managedExpenses', addItem(form.managedExpenses, { type: '', amount: '', description: '', bill: null }))}
            className="text-xs text-blue-600 hover:underline font-medium">+ Add</button>
        </div>
        {form.managedExpenses.map(ex => (
          <div key={ex.id} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input value={ex.type} onChange={e => set('managedExpenses', updateItem(form.managedExpenses, ex.id, 'type', e.target.value))}
              placeholder="Type (e.g. Brokerage)" className={fieldCls} />
            <input type="number" min="0" value={ex.amount} onChange={e => set('managedExpenses', updateItem(form.managedExpenses, ex.id, 'amount', e.target.value))}
              placeholder="Amount ₹" className={fieldCls} />
            <input value={ex.description} onChange={e => set('managedExpenses', updateItem(form.managedExpenses, ex.id, 'description', e.target.value))}
              placeholder="Description" className={fieldCls} />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <ImageUploadBtn value={ex.bill} onChange={v => set('managedExpenses', updateItem(form.managedExpenses, ex.id, 'bill', v))} label="Bill (optional)" />
              </div>
              <button type="button" onClick={() => set('managedExpenses', removeItem(form.managedExpenses, ex.id))}
                className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-100" />

      {/* Verification checkboxes */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Final Verification</p>
        {[
          { key: 'verifiedManage', label: 'I have thoroughly verified all the details' },
          { key: 'verifiedTripDetails', label: 'Trip details are correct and verified' },
          { key: 'verifiedFuelDetails', label: 'Fuel details are correct and verified' },
        ].map(({ key, label }) => (
          <label key={key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${form[key] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="accent-green-600 w-4 h-4" />
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {form[key] && <CheckCircle2 size={16} className="text-green-600 ml-auto" />}
          </label>
        ))}
      </div>

      {allVerified && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-medium">
          <CheckCircle2 size={16} /> Trip will be marked as <strong>Completed</strong> on save
        </div>
      )}
      {!allVerified && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Complete the create-trip verification and fuel verification to finish this trip as completed.
        </div>
      )}
    </div>
  )
}

// ─── Trip Detail View ─────────────────────────────────────────────────────────

function DetailSection({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0 w-32">{label}</span>
      <span className={`text-sm text-gray-800 text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</span>
    </div>
  )
}

function VerificationChip({ ok }) {
  return ok
    ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} />Verified</span>
    : <span className="text-xs text-gray-400">Not verified</span>
}

function TripDetail({ trip, drivers, onBack, onEdit }) {
  const driver = drivers.find(d => d.driverId === trip.driverId)
  const fuelTotal = tripFuelCost(trip)
  const rev = tripRevenue(trip)
  const net = tripNetPay(trip)
  const pendingBalance = (Number(trip.driverPayment?.totalAmount) || 0) - (Number(trip.driverPayment?.advance) || 0)
  const balance = trip.driverPayment?.duePaid ? 0 : pendingBalance
  const createExpenseTotal = (trip.otherExpenses || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const manageExpenseTotal = (trip.managedExpenses || []).reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Trips
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[trip.status]}`}>{statusLabel(trip.status)}</span>
          <button onClick={onEdit} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Pencil size={14} /> Edit Trip
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: fmt(rev), color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Net Pay', value: fmt(net), color: `${net >= 0 ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}` },
          { label: 'Fuel Cost', value: fmt(fuelTotal), color: 'text-orange-700 bg-orange-50 border-orange-200' },
          { label: 'Expenses + Driver', value: fmt(tripAllExpenses(trip)), color: 'text-violet-700 bg-violet-50 border-violet-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs opacity-70">{label}</p>
            <p className="text-lg font-bold mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Part 1 */}
      <DetailSection title="1. Create Trip">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <DetailRow label="Date" value={new Date(trip.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
            <DetailRow label="Origin" value={`${trip.originCustomer} — ${tripOrigin(trip)}`} />
            <DetailRow label="Destination" value={`${trip.destCustomer} — ${tripDest(trip)}`} />
            <DetailRow label="Commodity" value={trip.commodity} />
            <DetailRow label="Tons" value={trip.tons ? `${trip.tons} tons` : null} />
          </div>
          <div>
            <DetailRow label="Driver" value={driver ? `${driver.name} (${driver.driverId})` : trip.driverId} />
            <DetailRow label="Vehicle" value={trip.vehicleNumber} mono />
            <DetailRow label="Notes" value={trip.notes} />
            <div className="flex items-start justify-between py-1.5">
              <span className="text-xs text-gray-400 w-32">Verification</span>
              <VerificationChip ok={trip.verifiedCreate} />
            </div>
          </div>
        </div>
        {trip.driverPayment && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-6 text-sm">
            <div><p className="text-xs text-blue-500">Total Pay</p><p className="font-bold text-blue-800">{fmt(trip.driverPayment.totalAmount)}</p></div>
            <div><p className="text-xs text-blue-500">Advance</p><p className="font-bold text-blue-800">{fmt(trip.driverPayment.advance)}</p></div>
            <div><p className="text-xs text-blue-500">Balance</p><p className={`font-bold ${balance < 0 ? 'text-red-600' : 'text-blue-800'}`}>{fmt(balance)}</p></div>
            <div><p className="text-xs text-blue-500">Due Status</p><p className={`font-bold ${trip.driverPayment?.duePaid ? 'text-green-700' : 'text-blue-800'}`}>{trip.driverPayment?.duePaid ? 'Paid' : 'Pending'}</p></div>
          </div>
        )}
        {(trip.documents || []).length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Trip Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trip.documents.map((doc, index) => (
                <div key={doc.id || index} className="rounded-lg border border-gray-200 p-3 bg-gray-50 space-y-2">
                  <p className="text-sm font-medium text-gray-800">{doc.description || `Document ${index + 1}`}</p>
                  <AttachmentPreview value={doc.image} label="Open attachment" />
                </div>
              ))}
            </div>
          </div>
        )}
        {(trip.documents || []).length === 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
            No trip documents uploaded
          </div>
        )}
        {(trip.otherExpenses || []).length > 0 && (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">Other Expenses</p>
              <span className="text-xs font-semibold text-violet-700">{fmt(createExpenseTotal)}</span>
            </div>
            <div className="space-y-2">
              {trip.otherExpenses.map((expense, index) => (
                <div key={expense.id || index} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{expense.type || 'Expense'}</p>
                      <p className="text-xs text-gray-500 mt-1">{expense.description || 'No description added'}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{fmt(expense.amount)}</span>
                  </div>
                  <div className="mt-2">
                    <AttachmentPreview value={expense.billImage} label="Open bill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(trip.otherExpenses || []).length === 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
            No create-trip expenses recorded
          </div>
        )}
      </DetailSection>

      {/* Part 2 */}
      <DetailSection title={`2. Fuel Details (${(trip.fuelEntries || []).length} entries)`}>
        {(trip.fuelEntries || []).length === 0
          ? <p className="text-sm text-gray-400">No fuel entries recorded</p>
          : (
            <div className="space-y-3">
              {trip.fuelEntries.map((entry, index) => (
                <div key={entry.id || index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Fuel Entry {index + 1}</p>
                    <span className="text-sm font-bold text-orange-700">
                      {fmt((Number(entry.litres) || 0) * (Number(entry.perLtrCost) || 0))}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-xs text-gray-400">Date</p><p className="font-medium text-gray-800">{entry.date || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Odometer</p><p className="font-medium text-gray-800">{entry.odometer || '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Fuel</p><p className="font-medium text-gray-800">{entry.litres ? `${entry.litres} L` : '—'}</p></div>
                    <div><p className="text-xs text-gray-400">Per Litre</p><p className="font-medium text-gray-800">{entry.perLtrCost ? `₹${entry.perLtrCost}` : '—'}</p></div>
                  </div>
                  <div className="mt-3">
                    <AttachmentPreview value={entry.billImage} label="Open fuel bill" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-end rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                <span className="text-sm font-semibold text-orange-700">Total Fuel Cost: {fmt(fuelTotal)}</span>
              </div>
            </div>
          )
        }
        <div className="mt-2 flex items-center justify-between py-1.5">
          <span className="text-xs text-gray-400">Fuel verification</span>
          <VerificationChip ok={trip.fuelVerified} />
        </div>
      </DetailSection>

      {/* Part 3 */}
      <DetailSection title="3. Manage Trip">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <DetailRow label="Rate Type" value={trip.rateType === 'flat' ? 'Flat Rate' : 'Freight Rate'} />
            {trip.rateType === 'freight' && <DetailRow label="Cost per Ton" value={`₹${trip.costPerTon}`} />}
            {trip.rateType === 'flat' && <DetailRow label="Flat Amount" value={fmt(trip.flatAmount)} />}
            <DetailRow label="Revenue" value={fmt(rev)} />
            <DetailRow label="Driver Salary" value={fmt(tripDriverSalary(trip))} />
            <DetailRow label="Toll Expense" value={fmt(trip.tollExpense)} />
          </div>
          <div>
            <div className="py-1.5 flex items-start justify-between border-b border-gray-50"><span className="text-xs text-gray-400 w-36">Manage verified</span><VerificationChip ok={trip.verifiedManage} /></div>
            <div className="py-1.5 flex items-start justify-between border-b border-gray-50"><span className="text-xs text-gray-400 w-36">Trip details verified</span><VerificationChip ok={trip.verifiedTripDetails} /></div>
            <div className="py-1.5 flex items-start justify-between border-b border-gray-50"><span className="text-xs text-gray-400 w-36">Fuel details verified</span><VerificationChip ok={trip.verifiedFuelDetails} /></div>
          </div>
        </div>
        {(trip.managedExpenses || []).length > 0 && (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">Other Expenses</p>
              <span className="text-xs font-semibold text-violet-700">{fmt(manageExpenseTotal)}</span>
            </div>
            <div className="space-y-2">
              {trip.managedExpenses.map((expense, index) => (
                <div key={expense.id || index} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{expense.type || 'Expense'}</p>
                      <p className="text-xs text-gray-500 mt-1">{expense.description || 'No description added'}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{fmt(expense.amount)}</span>
                  </div>
                  <div className="mt-2">
                    <AttachmentPreview value={expense.bill} label="Open bill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(trip.managedExpenses || []).length === 0 && (
          <div className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
            No managed expenses recorded
          </div>
        )}
      </DetailSection>
    </div>
  )
}

// ─── Trip Form (full page, 3 tabs) ────────────────────────────────────────────

function TripForm({ existing, drivers, vehicles, onSave, onBack }) {
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState(() => normalizeTrip(existing))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const nextStatus = statusLabel(tripStatus(form))

  const handleSave = (e) => {
    e.preventDefault()
    const status = tripStatus(form)
    onSave({ ...normalizeTrip(form), status })
  }

  const tabs = ['Create Trip', 'Fuel Details', 'Manage Trip']

  return (
    <div className="space-y-0 max-w-3xl">
      <div className="flex items-center justify-between mb-5">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">{existing ? 'Edit Trip' : 'New Trip'}</h1>
        <div className="w-20" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
        <form onSubmit={handleSave}>
          <div className="p-5 max-h-[65vh] overflow-y-auto">
            {tab === 0 && <CreateTripTab form={form} set={set} drivers={drivers} vehicles={vehicles} />}
            {tab === 1 && <FuelDetailsTab form={form} set={set} />}
            {tab === 2 && <ManageTripTab form={form} set={set} />}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex gap-2">
                {tab > 0 && <button type="button" onClick={() => setTab(t => t - 1)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white">← Previous</button>}
                {tab < 2 && <button type="button" onClick={() => setTab(t => t + 1)}
                  className="border border-blue-300 text-blue-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-50">Next →</button>}
              </div>
              <p className="text-xs text-gray-500">This trip will save as <span className="font-semibold text-gray-700">{nextStatus}</span>.</p>
            </div>
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700">
              {existing ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Trips List ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {createElement(icon, { size: 16, className: 'text-white' })}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-base font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

export default function Trips() {
  const { trips, drivers, vehicles, createTrip, updateTrip } = useData()
  const [view, setView] = useState('list') // list | detail | form
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')

  const timeFiltered = useMemo(() => filterByTime(trips, timeFilter), [trips, timeFilter])
  const stats = useMemo(() => {
    const rev = timeFiltered.reduce((s, t) => s + tripRevenue(t), 0)
    const fuel = timeFiltered.reduce((s, t) => s + tripFuelCost(t), 0)
    const exp = timeFiltered.reduce((s, t) => s + tripAllExpenses(t), 0)
    return {
      revenue: rev, netPay: rev - fuel - exp, fuel,
      completed: timeFiltered.filter(t => t.status === 'completed').length,
      inProgress: timeFiltered.filter(t => t.status === 'in_progress').length,
      count: timeFiltered.length,
    }
  }, [timeFiltered])

  const displayed = timeFiltered.filter(t =>
    `${t.originCustomer || ''} ${t.destCustomer || ''} ${t.originCity} ${t.destCity} ${t.commodity} ${t.driverId || ''} ${t.vehicleNumber || ''}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (form) => {
    try {
      let savedTrip
      if (selected && selected.id) {
        savedTrip = await updateTrip(selected.id, form)
        // If updateTrip returns undefined (no return value), fall back to merging
        if (!savedTrip) savedTrip = { ...(trips.find(t => t.id === selected.id) || selected), ...form }
      } else {
        savedTrip = await createTrip(form)
        if (!savedTrip) savedTrip = form
      }
      setSelected(savedTrip)
      setView('detail')
    } catch (err) {
      alert(err.message || 'Failed to save trip')
    }
  }

  if (view === 'detail' && selected) {
    const live = trips.find(t => t.id === selected.id) || selected
    return <TripDetail trip={live} drivers={drivers} onBack={() => setView('list')}
      onEdit={() => setView('form')} />
  }

  if (view === 'form') {
    const live = selected ? (trips.find(t => t.id === selected.id) || selected) : null
    return <TripForm existing={live} drivers={drivers} vehicles={vehicles} onSave={handleSave}
      onBack={() => { setView(selected ? 'detail' : 'list') }} />
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trips.length} total · {stats.inProgress} in progress</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button onClick={() => { setSelected(null); setView('form') }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> New Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(stats.revenue)} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Net Pay" value={fmt(stats.netPay)} color="bg-emerald-500" />
        <StatCard icon={Fuel} label="Fuel Costs" value={fmt(stats.fuel)} color="bg-orange-500" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-teal-500" />
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by city, commodity, driver, vehicle..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Driver / Vehicle</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Revenue</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Net</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map(t => {
              const driver = drivers.find(d => d.driverId === t.driverId)
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-xs">{tripOrigin(t)}</p>
                    <p className="text-xs text-gray-400">{tripDest(t)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.commodity} · {t.tons}T</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {driver ? (
                      <div className="flex items-center gap-2">
                        <Avatar src={driver.avatar} name={driver.name} size="sm" color="emerald" />
                        <div>
                          <p className="text-xs font-medium text-gray-800">{driver.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{t.vehicleNumber || '—'}</p>
                        </div>
                      </div>
                    ) : <span className="text-xs text-gray-400">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-right font-medium text-gray-900">{fmt(tripRevenue(t))}</td>
                  <td className={`px-4 py-3 hidden lg:table-cell text-right font-semibold ${tripNetPay(t) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(tripNetPay(t))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status]}`}>{statusLabel(t.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setSelected(t); setView('detail') }}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 font-medium">
                        <Eye size={13} /> View
                      </button>
                      <button onClick={() => { setSelected(t); setView('form') }}
                        className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {displayed.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No trips yet. Add your first trip!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
