import api from '../api/axios'

export interface LoginPayload {
  email: string
  password: string
  branchId: number
}

const AuthService = {
  login: async (data: LoginPayload) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
}

export default AuthService
