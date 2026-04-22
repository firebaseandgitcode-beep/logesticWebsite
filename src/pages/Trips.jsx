import { useState, useMemo } from 'react'
import { Plus, Search, TrendingUp, Route, Fuel, DollarSign, Package, CheckCircle } from 'lucide-react'
import { initialTrips, tripRevenue, tripNetPay } from '../data/store'
import Modal from '../components/Modal'

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TIME_FILTERS = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
  { label: 'Today', value: 'today' },
]

function statusStyle(status) {
  return {
    completed: 'bg-green-100 text-green-700',
    in_progress: 'bg-blue-100 text-blue-700',
    planned: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
  }[status] || 'bg-gray-100 text-gray-500'
}

function statusLabel(status) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label || status
}

function fmt(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

function TripForm({ onSave, onClose, existing }) {
  const empty = {
    date: '', origin: '', destination: '',
    miles: '', ratePerMile: '', flatRate: '',
    fuelCost: '', otherExpenses: '',
    loadWeight: '', commodity: '',
    status: 'completed', notes: '',
  }
  const [form, setForm] = useState(
    existing
      ? { ...existing, miles: String(existing.miles), ratePerMile: String(existing.ratePerMile),
          flatRate: String(existing.flatRate), fuelCost: String(existing.fuelCost),
          otherExpenses: String(existing.otherExpenses), loadWeight: String(existing.loadWeight) }
      : empty
  )

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const miles = parseFloat(form.miles) || 0
  const rpm = parseFloat(form.ratePerMile) || 0
  const flat = parseFloat(form.flatRate) || 0
  const revenue = flat > 0 ? flat : miles * rpm
  const net = revenue - (parseFloat(form.fuelCost) || 0) - (parseFloat(form.otherExpenses) || 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      miles: parseFloat(form.miles) || 0,
      ratePerMile: parseFloat(form.ratePerMile) || 0,
      flatRate: parseFloat(form.flatRate) || 0,
      fuelCost: parseFloat(form.fuelCost) || 0,
      otherExpenses: parseFloat(form.otherExpenses) || 0,
      loadWeight: parseFloat(form.loadWeight) || 0,
    })
  }

  const fieldCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date *</label>
          <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Miles *</label>
          <input type="number" required min="0" value={form.miles} onChange={e => set('miles', e.target.value)} placeholder="0" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Origin (City/State) *</label>
          <input required value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="Mumbai, MH" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Destination *</label>
          <input required value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Pune, MH" className={fieldCls} />
        </div>
      </div>

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Pay & Costs</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Rate per Mile (₹)</label>
          <input type="number" min="0" step="0.01" value={form.ratePerMile} onChange={e => set('ratePerMile', e.target.value)} placeholder="0.00" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Flat Rate (₹)
            <span className="text-gray-400 font-normal ml-1">— overrides RPM</span>
          </label>
          <input type="number" min="0" step="0.01" value={form.flatRate} onChange={e => set('flatRate', e.target.value)} placeholder="0.00" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fuel Cost (₹)</label>
          <input type="number" min="0" step="0.01" value={form.fuelCost} onChange={e => set('fuelCost', e.target.value)} placeholder="0.00" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Other Expenses (₹)</label>
          <input type="number" min="0" step="0.01" value={form.otherExpenses} onChange={e => set('otherExpenses', e.target.value)} placeholder="0.00" className={fieldCls} />
        </div>
      </div>

      {/* Live preview */}
      {(miles > 0 || flat > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-xs text-blue-500">Revenue</span>
            <p className="font-bold text-blue-700">{fmt(revenue)}</p>
          </div>
          <div>
            <span className="text-xs text-blue-500">Net Pay</span>
            <p className={`font-bold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(net)}</p>
          </div>
        </div>
      )}

      <hr className="border-gray-100" />
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Load Details</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Load Weight (kg)</label>
          <input type="number" min="0" value={form.loadWeight} onChange={e => set('loadWeight', e.target.value)} placeholder="0" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Commodity / Freight</label>
          <input value={form.commodity} onChange={e => set('commodity', e.target.value)} placeholder="e.g. Dry Goods" className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldCls}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
          rows={3} placeholder="Any additional notes..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          {existing ? 'Update Trip' : 'Add Trip'}
        </button>
      </div>
    </form>
  )
}

function filterByTime(trips, filter) {
  const now = new Date()
  return trips.filter(t => {
    const d = new Date(t.date)
    if (filter === 'today') return d.toDateString() === now.toDateString()
    if (filter === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - now.getDay())
      start.setHours(0, 0, 0, 0)
      return d >= start
    }
    if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    return true
  })
}

export default function Trips() {
  const [trips, setTrips] = useState(initialTrips)
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const timeFiltered = useMemo(() => filterByTime(trips, timeFilter), [trips, timeFilter])

  const stats = useMemo(() => {
    const totalRevenue = timeFiltered.reduce((s, t) => s + tripRevenue(t), 0)
    const totalFuel = timeFiltered.reduce((s, t) => s + t.fuelCost, 0)
    const totalOther = timeFiltered.reduce((s, t) => s + t.otherExpenses, 0)
    const totalMiles = timeFiltered.reduce((s, t) => s + t.miles, 0)
    const netPay = totalRevenue - totalFuel - totalOther
    const completed = timeFiltered.filter(t => t.status === 'completed').length
    return { totalRevenue, totalFuel, totalOther, totalMiles, netPay, completed, count: timeFiltered.length }
  }, [timeFiltered])

  const displayed = timeFiltered.filter(t =>
    t.origin.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase()) ||
    t.commodity.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (form) => {
    if (editing) {
      setTrips(ts => ts.map(t => t.id === editing.id ? { ...t, ...form } : t))
    } else {
      setTrips(ts => [...ts, { ...form, id: Date.now() }])
    }
    setShowModal(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trips.length} total trips</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {TIME_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button onClick={() => { setEditing(null); setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Trip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Total Revenue" value={fmt(stats.totalRevenue)} color="bg-blue-500" />
        <StatCard icon={TrendingUp} label="Net Pay" value={fmt(stats.netPay)} color="bg-emerald-500" />
        <StatCard icon={Route} label="Total Miles" value={`${stats.totalMiles.toLocaleString()} km`} color="bg-violet-500" />
        <StatCard icon={DollarSign} label="Revenue / km" value={stats.totalMiles ? fmt(stats.totalRevenue / stats.totalMiles) : '—'} color="bg-orange-500" />
        <StatCard icon={Fuel} label="Fuel Costs" value={fmt(stats.totalFuel)} color="bg-red-500" />
        <StatCard icon={Package} label="Other Expenses" value={fmt(stats.totalOther)} color="bg-pink-500" />
        <StatCard icon={Route} label="Trips" value={stats.count} color="bg-indigo-500" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-teal-500" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by origin, destination or commodity..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Route</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Commodity</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Revenue</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Net Pay</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">km</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map(t => {
              const rev = tripRevenue(t)
              const net = tripNetPay(t)
              return (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 truncate max-w-[160px]">{t.origin}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{t.destination}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{t.commodity || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-right font-medium text-gray-900">{fmt(rev)}</td>
                  <td className={`px-4 py-3 hidden md:table-cell text-right font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(net)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-right text-gray-600">{t.miles.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle(t.status)}`}>
                      {statusLabel(t.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(t); setShowModal(true) }}
                      className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                  </td>
                </tr>
              )
            })}
            {displayed.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                No trips yet. Add your first trip!
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Trip' : 'Add New Trip'}
          onClose={() => { setShowModal(false); setEditing(null) }}
        >
          <TripForm
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null) }}
            existing={editing}
          />
        </Modal>
      )}
    </div>
  )
}
