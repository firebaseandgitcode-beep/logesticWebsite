import { useState, useRef } from 'react'
import { Plus, Search, ArrowLeft, Eye, Camera, ChevronRight } from 'lucide-react'
import { generateManagerId } from '../data/store'
import { useData } from '../context/DataContext'
import Avatar from '../components/Avatar'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

const ROLES = ['Trip Creator', 'Fuel Manager', 'Trip Manager', 'Custom']

const JOB_OPTIONS = [
  { key: 'create_trip', label: 'Create Trip' },
  { key: 'fuel_details', label: 'Fuel Details' },
  { key: 'manage_trip', label: 'Manage Trip' },
]

const JOB_STYLE = {
  create_trip: 'bg-blue-100 text-blue-700',
  fuel_details: 'bg-orange-100 text-orange-700',
  manage_trip: 'bg-violet-100 text-violet-700',
}

const fieldCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

// ─── Form ────────────────────────────────────────────────────────────────────

function MemberForm({ onSave, onClose, existing, nextId }) {
  const avatarRef = useRef()
  const emptyForm = {
    avatar: null, name: '', email: '', phone: '',
    role: 'Trip Creator', customRole: '', jobs: [],
    username: '', password: '', confirmPassword: '',
    bankDetails: { bank: '', account: '', ifsc: '' },
    status: 'active',
  }
  const [form, setForm] = useState(existing
    ? { ...emptyForm, ...existing, password: '', confirmPassword: '' }
    : emptyForm
  )
  const [changePw, setChangePw] = useState(false)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setBank = (k, v) => setForm(f => ({ ...f, bankDetails: { ...f.bankDetails, [k]: v } }))
  const toggleJob = (key) => setForm(f => ({
    ...f,
    jobs: f.jobs.includes(key) ? f.jobs.filter(j => j !== key) : [...f.jobs, key],
  }))

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set('avatar', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    if (!existing && form.password !== form.confirmPassword) {
      setErr('Passwords do not match'); return
    }
    if (changePw && form.password !== form.confirmPassword) {
      setErr('Passwords do not match'); return
    }
    if (!existing && form.password.length < 6) {
      setErr('Password must be at least 6 characters'); return
    }
    const saved = { ...form }
    if (!changePw && existing) saved.password = existing.password
    delete saved.confirmPassword
    onSave(saved)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={form.avatar} name={form.name || 'New'} size="xl" color="violet" />
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
            <span className="inline-block mt-1 text-xs font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
              {nextId}
            </span>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Personal info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} className={fieldCls} placeholder="Priya Sharma" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className={fieldCls} placeholder="priya@mylogestic.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
          <input required value={form.phone} onChange={e => set('phone', e.target.value)} className={fieldCls} maxLength={10} placeholder="9876543210" />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Role + Jobs */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Role & Access</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
            <select required value={form.role} onChange={e => set('role', e.target.value)} className={fieldCls}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          {form.role === 'Custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom Role Name *</label>
              <input required value={form.customRole} onChange={e => set('customRole', e.target.value)}
                className={fieldCls} placeholder="e.g. Route Planner" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Jobs (select all that apply)</label>
          <div className="flex gap-3 flex-wrap">
            {JOB_OPTIONS.map(({ key, label }) => (
              <label key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                form.jobs.includes(key) ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" checked={form.jobs.includes(key)} onChange={() => toggleJob(key)} className="accent-blue-600" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Account */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Account Credentials</p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Username *</label>
          <input required value={form.username} onChange={e => set('username', e.target.value)} className={fieldCls} placeholder="priya.sharma" />
        </div>

        {!existing ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
              <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} className={fieldCls} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password *</label>
              <input required type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={fieldCls} placeholder="Repeat password" />
            </div>
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={changePw} onChange={e => setChangePw(e.target.checked)} className="accent-blue-600" />
              Change password
            </label>
            {changePw && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Password *</label>
                  <input required type="password" value={form.password} onChange={e => set('password', e.target.value)} className={fieldCls} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password *</label>
                  <input required type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={fieldCls} placeholder="Repeat password" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Bank + Status */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bank Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
            <input value={form.bankDetails.bank} onChange={e => setBank('bank', e.target.value)} className={fieldCls} placeholder="HDFC" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Account No.</label>
            <input value={form.bankDetails.account} onChange={e => setBank('account', e.target.value)} className={fieldCls} placeholder="1234567890" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">IFSC</label>
            <input value={form.bankDetails.ifsc} onChange={e => setBank('ifsc', e.target.value.toUpperCase())} className={`${fieldCls} uppercase`} placeholder="HDFC0001234" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldCls}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {err && <p className="text-sm text-red-600 font-medium">{err}</p>}

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
          {existing ? 'Update Member' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}

// ─── Member Detail View ───────────────────────────────────────────────────────

function MemberDetail({ member, history, onBack, onEdit }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = history.filter(h => {
    if (h.managerId !== member.managerId) return false
    if (from && h.date < from) return false
    if (to && h.date > to) return false
    return true
  })

  const displayRole = member.role === 'Custom' ? member.customRole : member.role

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Management
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Edit Profile
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar src={member.avatar} name={member.name} size="xl" color="violet" />
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{member.managerId}</p>
              </div>
              <Badge status={member.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div><p className="text-xs text-gray-400">Role</p><p className="font-medium text-gray-800">{displayRole}</p></div>
              <div><p className="text-xs text-gray-400">Email</p><p className="font-medium text-gray-800 truncate">{member.email}</p></div>
              <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium text-gray-800">{member.phone}</p></div>
              <div><p className="text-xs text-gray-400">Username</p><p className="font-mono text-gray-800">{member.username}</p></div>
              <div><p className="text-xs text-gray-400">Bank</p><p className="font-medium text-gray-800">{member.bankDetails.bank || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Account</p><p className="font-medium text-gray-800">{member.bankDetails.account || '—'}</p></div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1.5">Jobs</p>
              <div className="flex flex-wrap gap-1.5">
                {member.jobs.length === 0
                  ? <span className="text-sm text-gray-400">No jobs assigned</span>
                  : member.jobs.map(j => (
                    <span key={j} className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STYLE[j]}`}>
                      {JOB_OPTIONS.find(o => o.key === j)?.label}
                    </span>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-800">Job History</h3>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-500 text-xs">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <label className="text-gray-500 text-xs">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
            {(from || to) && (
              <button onClick={() => { setFrom(''); setTo('') }}
                className="text-xs text-blue-600 hover:underline">Clear</button>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(h => (
              <tr key={h.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STYLE[h.jobType]}`}>
                    {JOB_OPTIONS.find(o => o.key === h.jobType)?.label}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700">{h.description}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">No job history found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Management() {
  const { management, setManagement, jobHistory } = useData()
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = management.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.managerId.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = (form) => {
    if (editing) {
      setManagement(ms => ms.map(m => m.id === editing.id ? { ...m, ...form } : m))
      if (selected?.id === editing.id) setSelected(prev => ({ ...prev, ...form }))
    } else {
      const newId = generateManagerId(management)
      setManagement(ms => [...ms, { ...form, id: Date.now(), managerId: newId }])
    }
    setShowModal(false)
    setEditing(null)
  }

  const toggleStatus = (id) =>
    setManagement(ms => ms.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m))

  if (view === 'detail' && selected) {
    const live = management.find(m => m.id === selected.id) || selected
    return (
      <MemberDetail
        member={live}
        history={jobHistory}
        onBack={() => setView('list')}
        onEdit={() => { setEditing(live); setShowModal(true) }}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{management.length} members</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, role or username..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Jobs</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Username</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatar} name={m.name} size="sm" color="violet" />
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{m.managerId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-700">{m.role === 'Custom' ? m.customRole : m.role}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {m.jobs.map(j => (
                      <span key={j} className={`text-xs px-2 py-0.5 rounded-full font-medium ${JOB_STYLE[j]}`}>
                        {JOB_OPTIONS.find(o => o.key === j)?.label}
                      </span>
                    ))}
                    {m.jobs.length === 0 && <span className="text-xs text-gray-400">—</span>}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell font-mono text-gray-600 text-xs">{m.username}</td>
                <td className="px-4 py-3"><Badge status={m.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setSelected(m); setView('detail') }}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 font-medium">
                      <Eye size={13} /> View
                    </button>
                    <button onClick={() => { setEditing(m); setShowModal(true) }}
                      className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                    <button onClick={() => toggleStatus(m.id)}
                      className="text-xs text-gray-400 hover:underline">
                      {m.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editing ? 'Edit Member' : 'Add Management Member'}
          onClose={() => { setShowModal(false); setEditing(null) }}
        >
          <MemberForm
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null) }}
            existing={editing}
            nextId={generateManagerId(management)}
          />
        </Modal>
      )}
    </div>
  )
}
