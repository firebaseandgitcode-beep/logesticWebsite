import { Truck, Users, UserCog, AlertTriangle } from 'lucide-react'
import { isExpired, isExpiringSoon } from '../data/store'
import { useData } from '../context/DataContext'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function AlertRow({ label, detail, type }) {
  const colors = {
    expired: 'bg-red-50 border-red-200 text-red-700',
    expiring: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]}`}>
      <AlertTriangle size={15} />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs ml-auto">{detail}</span>
    </div>
  )
}

export default function Dashboard() {
  const { vehicles, drivers, management } = useData()

  const activeVehicles = vehicles.filter(v => v.status === 'active').length
  const activeDrivers = drivers.filter(d => d.status === 'active').length
  const activeMgmt = management.filter(m => m.status === 'active').length

  const alerts = []
  vehicles.forEach(v => {
    if (isExpired(v.insurance.expiry)) alerts.push({ label: `${v.vehicleNumber} — Insurance expired`, detail: v.insurance.expiry, type: 'expired' })
    else if (isExpiringSoon(v.insurance.expiry)) alerts.push({ label: `${v.vehicleNumber} — Insurance expiring soon`, detail: v.insurance.expiry, type: 'expiring' })
    if (isExpired(v.pollution.expiry)) alerts.push({ label: `${v.vehicleNumber} — Pollution cert expired`, detail: v.pollution.expiry, type: 'expired' })
    else if (isExpiringSoon(v.pollution.expiry)) alerts.push({ label: `${v.vehicleNumber} — Pollution cert expiring soon`, detail: v.pollution.expiry, type: 'expiring' })
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your fleet and team</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Truck} label="Active Vehicles" value={`${activeVehicles} / ${vehicles.length}`} color="bg-blue-500" />
        <StatCard icon={Users} label="Active Drivers" value={`${activeDrivers} / ${drivers.length}`} color="bg-emerald-500" />
        <StatCard icon={UserCog} label="Management" value={`${activeMgmt} / ${management.length}`} color="bg-violet-500" />
      </div>

      {alerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Alerts</h2>
          <div className="space-y-2">
            {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Vehicles</h2>
          <div className="space-y-3">
            {vehicles.slice(0, 3).map(v => {
              const driver = drivers.find(d => d.driverId === v.assignedDriver)
              return (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.vehicleNumber}</p>
                    <p className="text-xs text-gray-400">{v.make} · {v.vehicleType}{driver ? ` · ${driver.name}` : ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {v.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Drivers</h2>
          <div className="space-y-3">
            {drivers.slice(0, 3).map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.driverId}{d.assignedVehicle ? ` · ${d.assignedVehicle}` : ' · No vehicle'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
