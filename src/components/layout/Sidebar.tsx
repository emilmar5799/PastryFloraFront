import { NavLink } from 'react-router-dom'
import { 
  XMarkIcon, 
  HomeIcon, 
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CubeIcon,
  InboxIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  isOpen: boolean
  onClose: () => void
}

// Mapa de iconos para cada ruta
const iconMap: Record<string, React.FC<{className?: string}>> = {
  '/': HomeIcon,
  '/sales': ShoppingCartIcon,
  '/orders': DocumentTextIcon,
  '/reports': ChartBarIcon,
  '/products': CubeIcon,
  '/refill': InboxIcon,
  '/users': UserCircleIcon
}

const menu = [
  { label: 'Inicio', path: '/', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Ventas', path: '/sales', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Reservas', path: '/orders', roles: ['ADMIN', 'SUPERVISOR', 'REFILL', 'USER'] },
  { label: 'Reportes', path: '/reports', roles: ['ADMIN'] },
  { label: 'Productos', path: '/products', roles: ['ADMIN', 'SUPERVISOR'] },
  { label: 'Rellenar', path: '/refill', roles: ['ADMIN', 'SUPERVISOR', 'REFILL'] },
  { label: 'Usuarios', path: '/users', roles: ['ADMIN'] },
]

export default function Sidebar({ isOpen, onClose }: Props) {
  const { role } = useAuth()
  
  const filteredMenu = role ? menu.filter(item => item.roles.includes(role)) : []

  // Función para formatear el rol
  const formatRole = (role: string | null) => {
    if (!role) return 'No autenticado'
    const rolesMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'SUPERVISOR': 'Supervisor',
      'REFILL': 'Rellenador',
      'USER': 'Usuario'
    }
    return rolesMap[role] || role
  }

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0
          w-72 h-screen
          bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900
          text-white
          z-50
          transition-all duration-300 ease-in-out
          flex flex-col
          shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">PF</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Pastelería Flora</h2>
                <p className="text-xs text-gray-400 mt-1">Panel de Control</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
              aria-label="Cerrar menú"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Card */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primaryDark rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Sistema de Gestión</p>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheckIcon className="w-3 h-3 text-primary" />
                  <span className="text-xs text-gray-300">
                    {formatRole(role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-2 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Navegación Principal
            </p>
          </div>
          
          {filteredMenu.length > 0 ? (
            filteredMenu.map(item => {
              const Icon = iconMap[item.path] || HomeIcon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose()
                  }}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-4 border-primary shadow-lg' 
                        : 'hover:bg-white/5 hover:pl-5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-primary' : 'bg-white/10 group-hover:bg-primary/30'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              )
            })
          ) : role ? (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">No tienes permisos para acceder a ninguna sección</p>
            </div>
          ) : (
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                <UserCircleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Por favor, inicia sesión</p>
            </div>
          )}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-black/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Versión</span>
              <span className="text-xs font-medium text-white">1.0.0</span>
            </div>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 animate-pulse"></div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">
              © {new Date().getFullYear()} Pastelería Flora
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}