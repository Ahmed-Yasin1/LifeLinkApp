import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  loginUser as loginRequest,
  logoutUser as clearStoredSession,
  registerUser as registerRequest,
} from '../services/AuthService'

export const AuthContext = createContext(null)

const readStoredUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem('token')))

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setIsLoading(false)
      return
    }

    getCurrentUser()
      .then((currentUser) => {
        localStorage.setItem('user', JSON.stringify(currentUser))
        setUser(currentUser)
      })
      .catch(logout)
      .finally(() => setIsLoading(false))
  }, [logout])

  const login = useCallback(async (credentials) => {
    const { user: authenticatedUser } = await loginRequest(credentials)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const register = useCallback((payload) => registerRequest(payload), [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    register,
  }), [user, isLoading, login, logout, register])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
