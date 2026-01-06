import { useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import { AuthContext, type JwtPayload } from './authContext'
import type { Role } from '../types/Role'

interface Props {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [auth, setAuth] = useState<{ token: string | null; role: Role | null }>(() => {
    const storedToken = localStorage.getItem('token')
    console.log('🔐 Token en localStorage:', storedToken)
    
    if (!storedToken) {
      return { token: null, role: null }
    }

    try {
      const decoded = jwtDecode<JwtPayload>(storedToken)
      console.log('🔍 Token decodificado:', decoded)
      return { token: storedToken, role: decoded.role }
    } catch (error) {
      console.error('❌ Error decodificando token:', error)
      return { token: null, role: null }
    }
  })

  const login = (newToken: string) => {
    console.log('🚀 Login con token:', newToken)
    localStorage.setItem('token', newToken)
    try {
      const decoded = jwtDecode<JwtPayload>(newToken)
      console.log('✅ Token decodificado en login:', decoded)
      setAuth({ token: newToken, role: decoded.role })
    } catch (error) {
      console.error('❌ Error en login:', error)
      setAuth({ token: null, role: null })
    }
  }

  const logout = () => {
    console.log('👋 Logout ejecutado')
    localStorage.removeItem('token')
    setAuth({ token: null, role: null })
  }

  return (
    <AuthContext.Provider value={{ 
      token: auth.token, 
      role: auth.role, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  )
}