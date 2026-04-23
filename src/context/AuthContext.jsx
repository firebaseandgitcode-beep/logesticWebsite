import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEFAULT_USERS = [
  {
    id: 'SUPER001',
    name: 'Sujay G P',
    email: 'sujaygp001@gmail.com',
    phone: '9876543210',
    company: 'mylogestic',
    role: 'superadmin',
    status: 'active',
    password: 'Admin@1234',
    createdAt: '2026-01-01',
    avatar: null,
  },
]

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('logestic_current_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('logestic_users')
      return saved ? JSON.parse(saved) : DEFAULT_USERS
    } catch { return DEFAULT_USERS }
  })

  useEffect(() => {
    localStorage.setItem('logestic_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('logestic_current_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('logestic_current_user')
    }
  }, [currentUser])

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return { error: 'Invalid email or password' }
    if (user.status === 'pending') return { error: 'Your account is pending approval by the admin' }
    if (user.status === 'suspended') return { error: 'Your account has been suspended. Contact support.' }
    if (user.role !== 'superadmin') return { error: 'Access denied. This portal is for super admins only.' }
    setCurrentUser(user)
    return { success: true }
  }

  const register = (data) => {
    const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase())
    if (existing) return { error: 'An account with this email already exists' }
    const newUser = {
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
      ...data,
      role: 'pending',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      avatar: null,
    }
    setUsers(prev => [...prev, newUser])
    return { success: true }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const updateAvatar = (avatar) => {
    if (!currentUser) return
    const updated = { ...currentUser, avatar }
    setCurrentUser(updated)
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
