import { createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Route, Users, BarChart3, Shield, Bell } from 'lucide-react'

const features = [
  {
    icon: Route,
    title: 'Trip Management',
    desc: 'Create, track and verify trips end-to-end with multi-stage approval workflows.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Truck,
    title: 'Fleet Tracking',
    desc: 'Manage your entire fleet with real-time status, document tracking, and vehicle assignments.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Users,
    title: 'Driver Management',
    desc: 'Keep driver profiles, licenses, bank details, and vehicle assignments organized in one place.',
    color: 'bg-violet-100 text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Financial Tracking',
    desc: 'Track revenue, fuel costs, toll expenses, and driver payments for every trip automatically.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Shield,
    title: 'Document Compliance',
    desc: 'Never miss an insurance or pollution certificate renewal with automated expiry alerts.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    desc: 'Get instant notifications for expiring documents, delayed trips, and pending approvals.',
    color: 'bg-cyan-100 text-cyan-600',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 sticky top-0 bg-white/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">mylogestic</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Shield size={12} /> Built for Indian logistics businesses
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-5 leading-tight">
          Run your fleet.<br />Manage every trip.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          mylogestic is the all-in-one platform for logistics businesses to manage vehicles, drivers, trips, and finances — without the paperwork chaos.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm"
          >
            Start for free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Sign in to your account
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'Trips managed' },
            { value: '100+', label: 'Vehicles tracked' },
            { value: '₹2Cr+', label: 'Revenue processed' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Everything you need to run your logistics business
        </h2>
        <p className="text-gray-500 text-center mb-12 text-sm">
          From the moment a trip is created to the final settlement, mylogestic handles it all.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-4`}>
                {createElement(icon, { size: 18 })}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create an account', desc: 'Register your company and get your super admin access within 24 hours.' },
              { step: '02', title: 'Add your fleet', desc: 'Add your vehicles and drivers. Assign them to each other and track documents.' },
              { step: '03', title: 'Start managing trips', desc: 'Create trips, track fuel, manage expenses, and get financial summaries per trip.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to streamline your fleet operations?
          </h2>
          <p className="text-blue-100 mb-8 text-sm">
            Join hundreds of logistics businesses already using mylogestic.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
          >
            Create your free account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Truck size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">mylogestic</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 mylogestic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
