import { useContext } from 'react'
import { AuthContext } from '../context/authContext'
import type { AuthContextType } from '../context/authContext'

export const useAuth = () => {
  const context = useContext<AuthContextType>(AuthContext)
  return context
}
