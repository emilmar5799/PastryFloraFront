// src/components/ui/Modal.tsx
import type { ReactNode } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export type ModalType = 'info' | 'success' | 'warning' | 'danger'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  type?: ModalType
  showCloseButton?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const typeConfig = {
  info: {
    icon: InformationCircleIcon,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  success: {
    icon: CheckCircleIcon,
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800'
  },
  danger: {
    icon: ExclamationTriangleIcon,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  }
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  showCloseButton = true,
  maxWidth = 'md'
}: ModalProps) {
  if (!isOpen) return null

  const config = typeConfig[type]
  const Icon = config.icon

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`w-full ${maxWidthClasses[maxWidth]} transform transition-all duration-300 scale-100 opacity-100`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-5 ${config.bgColor} border-b ${config.borderColor} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
                <h3 className={`font-bold text-lg ${config.textColor}`}>
                  {title}
                </h3>
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white/50 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Componente para botones del modal
interface ModalButtonsProps {
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger'
  loading?: boolean
  showCancel?: boolean
}

export function ModalButtons({
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmType = 'primary',
  loading = false,
  showCancel = true
}: ModalButtonsProps) {
  const confirmButtonClass = confirmType === 'danger'
    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    : 'bg-gradient-to-r from-primary to-primaryDark hover:from-primaryDark hover:to-primary'

  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
      {showCancel && onCancel && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
      )}
      
      {onConfirm && (
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2.5 text-white font-medium rounded-xl transition-all ${confirmButtonClass} hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2`}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {confirmText}
        </button>
      )}
    </div>
  )
}