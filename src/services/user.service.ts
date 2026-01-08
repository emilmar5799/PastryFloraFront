// user.service.ts
import api from '../api/axios'
import type { User } from '../types/User'

// Define la interfaz para crear usuario
export interface CreateUserPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  role: User['role']
  phones: string[]
}

// Interfaz para actualizar usuario
export interface UpdateUserPayload {
  first_name?: string
  last_name?: string
  email?: string
  role?: User['role']
  phones?: string[]
  active?: boolean
}

export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users')
  return data
}

export const getInactiveUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users/inactive')
  return data
}

export const getUserById = async (id: number): Promise<User> => {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  // Filtrar teléfonos vacíos
  const filteredPhones = payload.phones.filter(phone => phone.trim() !== '')
  
  const { data } = await api.post('/users', {
    ...payload,
    phones: filteredPhones
  })
  return data
}

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<User> => {
  // Filtrar teléfonos vacíos si existen
  const cleanedPayload = { ...payload }
  if (cleanedPayload.phones) {
    cleanedPayload.phones = cleanedPayload.phones.filter(phone => phone.trim() !== '')
  }
  
  const { data } = await api.put(`/users/${id}`, cleanedPayload)
  return data
}

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`)
}

export const reactivateUser = async (id: number): Promise<void> => {
  await api.patch(`/users/${id}/reactivate`)
}