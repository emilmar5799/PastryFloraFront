// src/hooks/useUsers.ts
import { useEffect, useState } from 'react'
import * as UserService from '../services/user.service'
import type { User } from '../types/User'

export function useUsers() {
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Obtener ambos tipos de usuarios en paralelo
      const [activeData, inactiveData] = await Promise.all([
        UserService.getUsers(),           // Usuarios activos
        UserService.getInactiveUsers()    // Usuarios inactivos
      ])
      
      setActiveUsers(activeData)
      setInactiveUsers(inactiveData)
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown): string => {
        if (e instanceof Error) return e.message
        const maybe = e as { response?: { data?: { message?: unknown } } } | undefined
        const msg = maybe?.response?.data?.message
        if (typeof msg === 'string') return msg
        return 'Error al cargar los usuarios'
      }

      console.error('Error fetching users:', err)
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  // Usuarios combinados (opcional)
  const allUsers = [...activeUsers, ...inactiveUsers]

  return {
    users: allUsers,           // Todos los usuarios combinados
    activeUsers,              // Solo usuarios activos
    inactiveUsers,            // Solo usuarios inactivos
    loading,
    error,
    refresh: fetchAllUsers
  }
}