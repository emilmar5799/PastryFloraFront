import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SaleService from '../../services/sale.service'
import type { Sale } from '../../types/Sale'
import { useModal } from '../../hooks/useModal'
import Modal, { ModalButtons } from '../../components/ui/Modal'
import {
  ShoppingCartIcon,
  PlusCircleIcon,
  EyeIcon,
  XCircleIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import {
  utcToBoliviaTime,
  formatDateTimeForDisplay,
  getTimeAgo
} from '../../utils/dateUtils'

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')
  const navigate = useNavigate()

  // Usamos el hook de modal
  const {
    modalConfig,
    isModalOpen,
    isLoading,
    showModal,
    hideModal,
    handleConfirm
  } = useModal()

  const loadSales = async () => {
    setLoading(true)
    try {
      const data = await SaleService.getAll()
      setSales(data)
    } catch (err: any) {
      showModal({
        title: 'Error',
        message: `Error al cargar ventas: ${err.message}`,
        type: 'danger',
        confirmText: 'Reintentar',
        showCancel: false,
        onConfirm: loadSales
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const handleCancelSale = (sale: Sale) => {
    showModal({
      title: 'Cancelar Venta',
      message: `¿Estás seguro de cancelar la venta #${sale.id} por Bs ${sale.total}?`,
      type: 'warning',
      confirmText: 'Sí, cancelar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await SaleService.cancel(sale.id)
          showModal({
            title: 'Venta Cancelada',
            message: `La venta #${sale.id} ha sido cancelada correctamente.`,
            type: 'success',
            confirmText: 'Aceptar',
            showCancel: false,
            onConfirm: loadSales
          })
        } catch (err: any) {
          showModal({
            title: 'Error',
            message: `Error al cancelar venta: ${err.message}`,
            type: 'danger',
            confirmText: 'Reintentar',
            showCancel: true,
            onConfirm: () => handleCancelSale(sale)
          })
        }
      }
    })
  }

  // Filtrar ventas según el filtro seleccionado
  const filteredSales = sales.filter(sale => {
    if (filter === 'active') return sale.status === 'ACTIVE'
    if (filter === 'cancelled') return sale.status === 'CANCELLED'
    return true
  })

  // Calcular estadísticas
  const activeSales = sales.filter(s => s.status === 'ACTIVE')
  const cancelledSales = sales.filter(s => s.status === 'CANCELLED')
  const totalRevenue = activeSales.reduce((sum, sale) => sum + Number(sale.total), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ventas...</p>
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
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Ventas</h1>
              <p className="text-gray-600 mt-1">Administra y revisa el historial de ventas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSales}
              disabled={loading || isLoading}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refrescar lista"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/sales/new')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-2.5 px-5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Nueva Venta
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats y Filtros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Resumen de Ventas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ventas activas</p>
                  <p className="text-2xl font-bold text-gray-800">{activeSales.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ventas canceladas</p>
                  <p className="text-2xl font-bold text-gray-800">{cancelledSales.length}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Ingreso total</p>
                  <p className="text-2xl font-bold text-gray-800">Bs {totalRevenue}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ReceiptPercentIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Filtrar por estado</h3>
            <div className="space-y-2">
              {[
                { id: 'all', label: 'Todas las ventas', count: sales.length, color: 'bg-gray-100 text-gray-800' },
                { id: 'active', label: 'Ventas activas', count: activeSales.length, color: 'bg-green-100 text-green-800' },
                { id: 'cancelled', label: 'Ventas canceladas', count: cancelledSales.length, color: 'bg-red-100 text-red-800' }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as any)}
                  className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                    filter === filterOption.id
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{filterOption.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${filterOption.color}`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de ventas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Historial de Ventas</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredSales.length} venta{filteredSales.length !== 1 ? 's' : ''} encontrada{filteredSales.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  {filter === 'all' ? 'Todas' : filter === 'active' ? 'Activas' : 'Canceladas'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredSales.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium mb-2">
                    No hay ventas {filter !== 'all' ? filter === 'active' ? 'activas' : 'canceladas' : ''}
                  </p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Ver todas las ventas
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Venta
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSales.map(sale => {
                      const saleDate = utcToBoliviaTime(sale.created_at)
                      
                      return (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-gray-900">#{sale.id}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <ClockIcon className="w-3 h-3" />
                                <span>{getTimeAgo(saleDate)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <ReceiptPercentIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-bold text-green-600 text-lg">
                                Bs {sale.total}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p>{formatDateTimeForDisplay(saleDate)}</p>
                                <p className="text-xs text-gray-500">Hora Bolivia</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {sale.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <PlusCircleIcon className="w-3.5 h-3.5" />
                                Activa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                <XCircleIcon className="w-3.5 h-3.5" />
                                Cancelada
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => navigate(`/sales/${sale.id}`)}
                                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                                title="Ver detalles"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              {sale.status === 'ACTIVE' && (
                                <button
                                  onClick={() => handleCancelSale(sale)}
                                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                                  title="Cancelar venta"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer de la tabla */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  Mostrando <span className="font-medium">{filteredSales.length}</span> de{' '}
                  <span className="font-medium">{sales.length}</span> ventas
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Activa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Cancelada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}