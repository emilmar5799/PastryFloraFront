import type { User } from '../../types/User'
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

interface Props {
  title: string
  users: User[]
  inactive?: boolean
  onEdit?: (user: User) => void
  onDelete?: (id: number) => void
  onReactivate?: (id: number) => void
}

export default function UserTable({
  title,
  users,
  inactive = false,
  onEdit,
  onDelete,
  onReactivate,
}: Props) {
  // Función para formatear el rol
  const formatRole = (role: string) => {
    const rolesMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'SUPERVISOR': 'Supervisor',
      'SELLER': 'Vendedor',
      'REFILL': 'Rellenador'
    }
    return rolesMap[role] || role
  }

  // Función para obtener el color del badge según el rol
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-800 border border-purple-200',
      'SUPERVISOR': 'bg-blue-100 text-blue-800 border border-blue-200',
      'SELLER': 'bg-green-100 text-green-800 border border-green-200',
      'REFILL': 'bg-amber-100 text-amber-800 border border-amber-200'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} usuario{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${inactive ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
            {inactive ? '✗ Inactivos' : '✓ Activos'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfonos
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <UserCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">No hay usuarios {inactive ? 'inactivos' : 'activos'}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {inactive 
                        ? 'Todos los usuarios están activos en el sistema'
                        : 'No se encontraron usuarios activos'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                        <span className="font-bold text-primary">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">ID: {user.id}</span> • 
                          Creado: {new Date(user.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {user.phones && user.phones.length > 0 ? (
                      <div className="space-y-1">
                        {user.phones.map((phone, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-sm">
                            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-mono">{phone}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Sin teléfonos</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-1.5">
                      {!inactive && onEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                          title="Editar usuario"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {!inactive && onDelete && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                          title="Desactivar usuario"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                      {inactive && onReactivate && (
                        <button
                          onClick={() => onReactivate(user.id)}
                          className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                          title="Reactivar usuario"
                        >
                          <ArrowPathIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}