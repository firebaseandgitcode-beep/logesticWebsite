import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

const LOCAL_LOGIN = {
  email: 'admin@local.test',
  password: 'Admin@1234',
  user: {
    id: 'local-user',
    name: 'Local Admin',
    email: 'admin@local.test',
    phone: '9999999999',
    company: 'Local Logistics',
    role: 'user',
    status: 'active',
  },
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('logestic_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('logestic_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('logestic_user')
      localStorage.removeItem('logestic_token')
    }
  }, [currentUser])

  const login = async (email, password) => {
    setLoading(true)
    try {
      if (import.meta.env.DEV && email === LOCAL_LOGIN.email && password === LOCAL_LOGIN.password) {
        localStorage.setItem('logestic_token', 'local-dev-token')
        setCurrentUser(LOCAL_LOGIN.user)
        return { success: true }
      }
      const data = await api.login({ email, password })
      localStorage.setItem('logestic_token', data.token)
      setCurrentUser(data.user)
      return { success: true }
    } catch (err) {
      const status = err.data?.status
      if (status === 'pending') {
        return { error: "Your account is pending admin approval. You'll be notified once approved.", pending: true }
      }
      return { error: err.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      await api.register(data)
      return { success: true }
    } catch (err) {
      return { error: err.message || 'Registration failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const updateAvatar = (avatar) => {
    if (!currentUser) return
    const updated = { ...currentUser, avatar }
    setCurrentUser(updated)
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
