import { useEffect, useState } from 'react'
import type { User, UserRole } from '../../types/User'
import { createUser, updateUser } from '../../services/user.service'

interface Props {
  user: User | null
  onSuccess: () => void
}

export default function UserForm({ user, onSuccess }: Props) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'SELLER' as UserRole,
    phones: [''],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: '', // No mostrar password en edición
        role: user.role,
        phones: user.phones && user.phones.length > 0 ? user.phones : [''],
      })
    } else {
      // Resetear formulario para nuevo usuario
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'SELLER',
        phones: [''],
      })
    }
  }, [user])

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...form.phones]
    newPhones[index] = value
    setForm({ ...form, phones: newPhones })
  }

  const addPhone = () => {
    setForm({ ...form, phones: [...form.phones, ''] })
  }

  const removePhone = (index: number) => {
    if (form.phones.length > 1) {
      const newPhones = form.phones.filter((_, i) => i !== index)
      setForm({ ...form, phones: newPhones })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Filtrar teléfonos vacíos
      const phonesToSend = form.phones.filter(phone => phone.trim() !== '')
      
      if (user) {
        // Editar usuario existente
        await updateUser(user.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role: form.role,
          phones: phonesToSend.length > 0 ? phonesToSend : undefined,
        })
      } else {
        // Crear nuevo usuario
        if (!form.password) {
          throw new Error('La contraseña es requerida')
        }
        
        await createUser({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
          role: form.role,
          phones: phonesToSend,
        })
      }

      // Resetear formulario
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'SELLER',
        phones: [''],
      })
      
      onSuccess()
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown): string => {
        if (e instanceof Error) return e.message
        const maybe = e as { response?: { data?: { message?: unknown } } } | undefined
        const msg = maybe?.response?.data?.message
        if (typeof msg === 'string') return msg
        return 'Error al guardar el usuario'
      }

      setError(getErrorMessage(err))
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-2xl">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {user ? '✏️ Editar usuario' : '👤 Crear nuevo usuario'}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          {user ? 'Modifica los datos del usuario' : 'Completa los datos para registrar un nuevo usuario'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              placeholder="Ej: Juan"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              placeholder="Ej: Pérez"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            placeholder="ejemplo@pasteleriaflora.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* Contraseña (solo para crear) */}
        {!user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
        )}

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
            disabled={loading}
          >
            <option value="ADMIN">Administrador</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="SELLER">Vendedor</option>
            <option value="REFILL">Rellenador</option>
          </select>
        </div>

        {/* Teléfonos */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Teléfonos
            </label>
            <button
              type="button"
              onClick={addPhone}
              className="text-sm text-primary hover:text-primaryDark font-medium flex items-center gap-1"
              disabled={loading}
            >
              <span className="text-lg">+</span> Agregar teléfono
            </button>
          </div>
          
          <div className="space-y-3">
            {form.phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="tel"
                  placeholder="Ej: 71234567"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  value={phone}
                  onChange={e => handlePhoneChange(index, e.target.value)}
                  disabled={loading}
                />
                {form.phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="px-4 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Los teléfonos son opcionales. Deja vacío si no deseas agregar.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary to-primaryDark text-white font-medium py-3.5 px-4 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </div>
            ) : user ? (
              'Actualizar usuario'
            ) : (
              'Crear usuario'
            )}
          </button>
          
          {user && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  first_name: '',
                  last_name: '',
                  email: '',
                  password: '',
                  role: 'SELLER',
                  phones: [''],
                })
                onSuccess()
              }}
              className="px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}