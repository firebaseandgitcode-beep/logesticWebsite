import { useState, useRef } from 'react'
import { Camera, Save, Lock, Bell, Building2, Mail, Phone, MapPin, User } from 'lucide-react'

const DEFAULT_PROFILE = {
  name: 'Sujay G P',
  email: 'sujay@mylogestic.com',
  phone: '9876543210',
  role: 'Super Admin',
  company: 'mylogestic',
  location: 'Bangalore, KA',
  avatar: null,
  notifications: {
    emailAlerts: true,
    expiryReminders: true,
    tripUpdates: false,
  },
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 mb-1.5">
        {Icon && <Icon size={12} className="text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
const readonlyCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"

export default function Profile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [saved, setSaved] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const avatarRef = useRef()

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))
  const setNotif = (k, v) => setProfile(p => ({ ...p, notifications: { ...p.notifications, [k]: v } }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('avatar', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      setPwMsg('error:Passwords do not match')
      return
    }
    if (passwordForm.next.length < 8) {
      setPwMsg('error:Password must be at least 8 characters')
      return
    }
    setPwMsg('success:Password updated successfully')
    setPasswordForm({ current: '', next: '', confirm: '' })
    setTimeout(() => setPwMsg(''), 3000)
  }

  const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account details and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar + name header */}
        <Section title="Personal Information">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden ring-4 ring-blue-50">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-white text-2xl font-bold">{initials}</span>
                  }
                </div>
                <button type="button" onClick={() => avatarRef.current.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Camera size={13} className="text-gray-600" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <span className="text-xs text-gray-400 text-center">Click camera to<br />change photo</span>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" icon={User}>
                <input value={profile.name} onChange={e => set('name', e.target.value)}
                  required className={inputCls} />
              </Field>

              <Field label="Role">
                <input value={profile.role} readOnly className={readonlyCls} />
              </Field>

              <Field label="Email Address" icon={Mail}>
                <input type="email" value={profile.email} onChange={e => set('email', e.target.value)}
                  required className={inputCls} />
              </Field>

              <Field label="Phone" icon={Phone}>
                <input value={profile.phone} onChange={e => set('phone', e.target.value)}
                  className={inputCls} maxLength={10} />
              </Field>

              <Field label="Company" icon={Building2}>
                <input value={profile.company} onChange={e => set('company', e.target.value)}
                  className={inputCls} />
              </Field>

              <Field label="Location" icon={MapPin}>
                <input value={profile.location} onChange={e => set('location', e.target.value)}
                  placeholder="City, State" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Save size={14} /> Save Changes
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Saved successfully</span>
            )}
          </div>
        </Section>
      </form>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important alerts via email' },
            { key: 'expiryReminders', label: 'Document Expiry Reminders', desc: 'Get notified before insurance & pollution certs expire' },
            { key: 'tripUpdates', label: 'Trip Status Updates', desc: 'Notifications when trip status changes' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button type="button"
                onClick={() => setNotif(key, !profile.notifications[key])}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${profile.notifications[key] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${profile.notifications[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Change Password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <Field label="Current Password" icon={Lock}>
            <input type="password" value={passwordForm.current}
              onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
              required placeholder="••••••••" className={inputCls} />
          </Field>
          <Field label="New Password">
            <input type="password" value={passwordForm.next}
              onChange={e => setPasswordForm(f => ({ ...f, next: e.target.value }))}
              required placeholder="Min. 8 characters" className={inputCls} />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" value={passwordForm.confirm}
              onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
              required placeholder="••••••••" className={inputCls} />
          </Field>

          {pwMsg && (
            <p className={`text-sm font-medium ${pwMsg.startsWith('error') ? 'text-red-600' : 'text-green-600'}`}>
              {pwMsg.split(':')[1]}
            </p>
          )}

          <button type="submit"
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            <Lock size={13} /> Update Password
          </button>
        </form>
      </Section>
    </div>
  )
}
