import { createContext } from 'react'
import type { Role } from '../types/Role'

interface JwtPayload {
  role: Role
  sub: string
  exp: number
}

interface AuthContextType {
  token: string | null
  role: Role | null
  login: (token: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
)

export type { JwtPayload, AuthContextType }
