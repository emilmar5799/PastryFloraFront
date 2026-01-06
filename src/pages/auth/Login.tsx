import { useState } from 'react'
import { AxiosError } from 'axios'
import AuthService from '../../services/auth.service'
import { useAuth } from '../../hooks/useAuth'
import './login.css'

export default function Login() {
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [branchId, setBranchId] = useState(1)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await AuthService.login({
        email,
        password,
        branchId,
      })

      login(result.token)
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as Record<string, string>
        setError(data.message || 'Error al iniciar sesión')
      } else {
        setError('Error al iniciar sesión')
      }
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Pastelería Flora</h1>
        <p>Acceso al sistema</p>

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select value={branchId} onChange={(e) => setBranchId(Number(e.target.value))}>
          <option value={1}>Pastelería Flora 13</option>
          <option value={2}>Pastelería Flora 8</option>
        </select>

        {error && <span className="error">{error}</span>}

        <button type="submit">Ingresar</button>
      </form>
    </div>
  )
}
