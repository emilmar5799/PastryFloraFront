import { useContext } from 'react'
import { AuthContext } from '../context/auth.context'
import type { AuthContextType } from '../context/auth.context'

export const useAuth = () => {
  const context = useContext<AuthContextType>(AuthContext)
  return context
}
