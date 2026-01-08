import { useState } from 'react'
import type { User } from '../../types/User'
import { useUsers } from '../../hooks/useUsers'
import * as UserService from '../../services/user.service'
import { useModal } from '../../hooks/useModal'
import Modal, { ModalButtons } from '../../components/ui/Modal'
import UserForm from './UserForm'
import UserTable from './UsersTable'
import { 
  UsersIcon, 
  UserPlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function Users() {
  const { activeUsers, inactiveUsers, loading, error, refresh } = useUsers()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  
  // Usamos el hook de modal
  const { 
    modalConfig, 
    isModalOpen, 
    isLoading, 
    showModal, 
    hideModal, 
    handleConfirm 
  } = useModal()

  const extractErrorMessage = (e: unknown, fallback = 'Error inesperado') => {
    if (e instanceof Error) return e.message
    const maybe = e as { response?: { data?: { message?: unknown } } } | undefined
    const msg = maybe?.response?.data?.message
    if (typeof msg === 'string') return msg
    return fallback
  }

  // Función para manejar la eliminación (desactivación)
  const handleDeleteUser = (id: number, userName: string) => {
    showModal({
      title: 'Desactivar Usuario',
      message: `¿Estás seguro de desactivar al usuario "${userName}"?`,
      type: 'warning',
      confirmText: 'Desactivar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await UserService.deleteUser(id)
          showModal({
            title: 'Usuario Desactivado',
            message: `El usuario "${userName}" ha sido desactivado correctamente.`,
            type: 'success',
            confirmText: 'Aceptar',
            showCancel: false,
            onConfirm: refresh
          })
        } catch (err: unknown) {
          showModal({
            title: 'Error',
            message: `Error al desactivar el usuario: ${extractErrorMessage(err, 'Error al desactivar el usuario')}`,
            type: 'danger',
            confirmText: 'Reintentar',
            showCancel: true,
            onConfirm: () => handleDeleteUser(id, userName)
          })
        }
      }
    })
  }

  // Función para manejar la reactivación
  const handleReactivateUser = (id: number, userName: string) => {
    showModal({
      title: 'Reactivar Usuario',
      message: `¿Estás seguro de reactivar al usuario "${userName}"?`,
      type: 'info',
      confirmText: 'Reactivar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await UserService.reactivateUser(id)
          showModal({
            title: 'Usuario Reactivado',
            message: `El usuario "${userName}" ha sido reactivado correctamente.`,
            type: 'success',
            confirmText: 'Aceptar',
            showCancel: false,
            onConfirm: refresh
          })
        } catch (err: unknown) {
          showModal({
            title: 'Error',
            message: `Error al reactivar el usuario: ${extractErrorMessage(err, 'Error al reactivar el usuario')}`,
            type: 'danger',
            confirmText: 'Reintentar',
            showCancel: true,
            onConfirm: () => handleReactivateUser(id, userName)
          })
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto mt-8">
        <div className="flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-800 mb-2">Error al cargar usuarios</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={refresh}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Modal dinámico */}
      <Modal
        isOpen={isModalOpen}
        onClose={hideModal}
        title={modalConfig?.title || ''}
        type={modalConfig?.type || 'info'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {modalConfig?.message}
          </p>
          
          <ModalButtons
            onConfirm={modalConfig?.onConfirm ? handleConfirm : undefined}
            onCancel={modalConfig?.showCancel ? hideModal : undefined}
            confirmText={modalConfig?.confirmText}
            confirmType={modalConfig?.type === 'danger' ? 'danger' : 'primary'}
            loading={isLoading}
            showCancel={modalConfig?.showCancel}
          />
        </div>
      </Modal>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primaryDark rounded-xl flex items-center justify-center">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading || isLoading}
              className="p-3 text-gray-600 hover:text-primary hover:bg-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refrescar lista"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Usuarios activos</p>
                  <p className="text-2xl font-bold text-gray-800">{activeUsers.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Usuarios inactivos</p>
                  <p className="text-2xl font-bold text-gray-800">{inactiveUsers.length}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total usuarios</p>
                  <p className="text-2xl font-bold text-gray-800">{activeUsers.length + inactiveUsers.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserPlusIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-xl p-5">
            <h4 className="font-medium text-blue-800 mb-2">💡 Información</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Los usuarios inactivos no pueden iniciar sesión</li>
              <li>• Puedes reactivar usuarios inactivos</li>
              <li>• "Eliminar" desactiva el usuario</li>
            </ul>
          </div>
        </div>

        {/* Formulario y Tablas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Botón para mostrar formulario */}
          {!showForm && !editingUser && (
            <button
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primaryDark text-white font-medium py-4 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <UserPlusIcon className="w-6 h-6" />
              <span>Crear nuevo usuario</span>
            </button>
          )}

          {/* Formulario (visible al crear o editar) */}
          {(showForm || editingUser) && (
            <UserForm
              user={editingUser}
              onSuccess={() => {
                setEditingUser(null)
                setShowForm(false)
                refresh()
              }}
            />
          )}

          {/* Tabla de usuarios activos */}
          <UserTable
            title="Usuarios activos"
            users={activeUsers}
            onEdit={(user) => {
              setEditingUser(user)
              setShowForm(true)
            }}
            onDelete={(id) => {
              const user = activeUsers.find(u => u.id === id)
              if (user) {
                handleDeleteUser(id, `${user.first_name} ${user.last_name}`)
              }
            }}
          />

          {/* Tabla de usuarios inactivos (solo si hay) */}
          {inactiveUsers.length > 0 && (
            <div className="animate-fadeIn">
              <UserTable
                title="Usuarios inactivos"
                users={inactiveUsers}
                inactive={true}
                onReactivate={(id) => {
                  const user = inactiveUsers.find(u => u.id === id)
                  if (user) {
                    handleReactivateUser(id, `${user.first_name} ${user.last_name}`)
                  }
                }}
              />
            </div>
          )}

          {/* Mensaje cuando no hay usuarios inactivos */}
          {inactiveUsers.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-700 mb-2">No hay usuarios inactivos</h3>
              <p className="text-gray-500 text-sm">
                Todos los usuarios están actualmente activos en el sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}