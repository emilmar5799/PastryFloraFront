// src/hooks/useModal.ts
import { useState, useCallback } from 'react'

export interface ModalConfig {
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'danger'
  onConfirm?: () => void
  confirmText?: string
  showCancel?: boolean
}

export function useModal() {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const showModal = useCallback((config: ModalConfig) => {
    setModalConfig(config)
    setIsModalOpen(true)
  }, [])

  const hideModal = useCallback(() => {
    setIsModalOpen(false)
    setIsLoading(false)
    setTimeout(() => setModalConfig(null), 300) // Espera a que termine la animación
  }, [])

  const handleConfirm = async () => {
    if (modalConfig?.onConfirm) {
      setIsLoading(true)
      try {
        await modalConfig.onConfirm()
      } finally {
        hideModal()
      }
    }
  }

  return {
    modalConfig,
    isModalOpen,
    isLoading,
    showModal,
    hideModal,
    handleConfirm
  }
}