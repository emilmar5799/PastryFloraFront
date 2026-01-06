import { NavLink } from 'react-router-dom'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const menu = [
  { label: 'Home', path: '/', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Ventas', path: '/sales', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Reservas', path: '/orders', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Reportes', path: '/reports', roles: ['ADMIN'] },
  { label: 'Productos', path: '/products', roles: ['ADMIN', 'SUPERVISOR'] },
  { label: 'Rellenar', path: '/refill', roles: ['ADMIN', 'SUPERVISOR', 'REFILL'] },
]

export default function Sidebar({ isOpen, onClose }: Props) {
  const { role } = useAuth()
  
  // Si no hay rol, significa que no está autenticado
  // Pero en lugar de retornar null, retornamos el sidebar vacío
  // para mantener la estructura del layout
  
  const filteredMenu = role ? menu.filter(item => item.roles.includes(role)) : []

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:relative
          top-0 left-0
          w-64 h-screen
          bg-gradient-to-b from-primary to-primaryDark
          text-white
          z-50
          transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:shadow-lg
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold truncate">Pastelería Flora</h2>
            <p className="text-sm text-white/70 mt-1">
              {role ? `Rol: ${role}` : 'No autenticado'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredMenu.length > 0 ? (
            filteredMenu.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (window.innerWidth < 768) onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10 hover:translate-x-1'
                  }`
                }
              >
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))
          ) : role ? (
            <div className="text-center p-4 text-white/60">
              <p>No tienes permisos para acceder a ninguna sección</p>
            </div>
          ) : (
            <div className="text-center p-4 text-white/60">
              <p>Por favor, inicia sesión</p>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 text-sm text-white/60">
          <p>Versión 1.0.0</p>
          <p className="text-xs mt-1">© {new Date().getFullYear()}</p>
        </div>
      </aside>
    </>
  )
}