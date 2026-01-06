import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Bars3Icon } from '@heroicons/react/24/outline'

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

  return (
    <header className="sticky top-0 z-40 h-16 bg-white shadow-md border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Hamburger - visible solo en mobile */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Título y info del usuario */}
        <div className="flex flex-col">
          <h1 className="font-semibold text-gray-800">
            Pastelería Flora
          </h1>
          <span className="text-sm text-gray-500">
            Sistema de Gestión - {role || 'Usuario'}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-sm font-medium text-white bg-primary hover:bg-primaryDark px-4 py-2.5 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
      >
        Cerrar Sesión
      </button>
    </header>
  )
}