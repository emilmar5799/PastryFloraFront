import { useState } from 'react'
import { setToken, removeToken, getToken } from '../utils/token'
import { AuthContext } from './auth.context'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

  const login = (token: string) => {
    setToken(token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    removeToken()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
