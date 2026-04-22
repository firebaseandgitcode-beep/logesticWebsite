const COLORS = {
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
  emerald: 'bg-emerald-600',
  orange: 'bg-orange-500',
  rose: 'bg-rose-500',
}

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export default function Avatar({ src, name = '', size = 'md', color = 'blue', className = '' }) {
  const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div className={`${SIZES[size]} ${COLORS[color] || COLORS.blue} rounded-full flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span className="text-white font-bold leading-none">{initials}</span>
      }
    </div>
  )
}
