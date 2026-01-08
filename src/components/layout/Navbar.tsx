import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Bars3Icon, 
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface Props {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: Props) {
  const { logout, role } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Función para formatear el rol de manera más amigable
  const formatRole = (role: string | null) => {
    if (!role) return 'Invitado'
    const rolesMap: Record<string, string> = {
      'ADMIN': 'Administrador',
      'SUPERVISOR': 'Supervisor',
      'REFILL': 'Rellenador',
      'USER': 'Usuario'
    }
    return rolesMap[role] || role
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Hamburger - visible solo en mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
          aria-label="Abrir menú"
        >
          <Bars3Icon className="w-7 h-7 text-gray-700" />
        </button>

        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 bg-gradient-to-br from-primary to-primaryDark rounded-xl items-center justify-center">
            <span className="text-white font-bold text-lg">PF</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-gray-800 text-lg">
              Pastelería Flora
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {formatRole(role)}
              </span>
              <BellIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* User info y logout */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <UserCircleIcon className="w-8 h-8 text-gray-400" />
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-gray-700">
              Sistema de Gestión
            </span>
            <span className="text-xs text-gray-500">
              Panel de control
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200 hidden md:block" />

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-gray-50 active:scale-95"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  )
}