import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SaleService from '../../services/sale.service'
import type { Sale } from '../../types/Sale'
import { 
  ArrowLeftIcon,
  ReceiptPercentIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import {
  utcToBoliviaTime,
  formatDateTimeForDisplay,
  formatFullDateTime
} from '../../utils/dateUtils'

interface SaleProduct {
  id: number
  name: string
  quantity: number
  price_at_sale: number
  product_id: number
}

interface SaleDetail extends Sale {
  products: SaleProduct[]
  user?: {
    id: number
    name: string
    email: string
  }
}

export default function SaleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sale, setSale] = useState<SaleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    const loadSale = async () => {
      setLoading(true)
      try {
        const data = await SaleService.getById(Number(id))
        setSale(data)
      } catch (error) {
        console.error('Error loading sale:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSale()
  }, [id])

  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 100)
  }

  const formatPrice = (price: number): string => {
    const rounded = Math.round(price * 100) / 100
    const integerPart = Math.floor(rounded)
    const decimalPart = Math.round((rounded - integerPart) * 100)
    
    if (decimalPart === 0) return `${integerPart}.00`
    if (decimalPart < 10) return `${integerPart}.0${decimalPart}`
    return `${integerPart}.${decimalPart}`
  }

  const calculateSubtotal = () => {
    if (!sale?.products) return 0
    return sale.products.reduce((total, product) => 
      total + (product.price_at_sale * product.quantity), 0
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la venta...</p>
        </div>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ReceiptPercentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Venta no encontrada</h3>
          <p className="text-gray-500 mb-4">La venta que buscas no existe o fue eliminada.</p>
          <button
            onClick={() => navigate('/sales')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Volver a Ventas
          </button>
        </div>
      </div>
    )
  }

  const saleDate = utcToBoliviaTime(sale.created_at)
  const subtotal = calculateSubtotal()
  const productCount = sale.products?.length || 0
  const totalUnits = sale.products?.reduce((sum, p) => sum + p.quantity, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ReceiptPercentIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Venta #{sale.id}
              </h1>
              <p className="text-gray-600 mt-1">Detalles y productos de la venta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <PrinterIcon className="w-5 h-5" />
              Imprimir
            </button>
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la venta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Información de la Venta</h2>
            
            <div className="space-y-4">
              {/* Estado */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {sale.status === 'ACTIVE' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">Estado</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sale.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {sale.status === 'ACTIVE' ? 'Activa' : 'Cancelada'}
                </span>
              </div>

              {/* Fecha y hora */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">Fecha</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatDateTimeForDisplay(saleDate)}</p>
                  <p className="text-xs text-gray-500">Hora Bolivia</p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">Productos</span>
                  </div>
                  <span className="font-semibold text-blue-800">{productCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">Unidades</span>
                  </div>
                  <span className="font-semibold text-blue-800">{totalUnits}</span>
                </div>
                {sale.user && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-700">Vendedor</span>
                    </div>
                    <span className="font-semibold text-blue-800">{sale.user.name}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-800">Total Venta</span>
                  </div>
                  <span className="font-bold text-2xl text-purple-600">
                    Bs {formatPrice(sale.total)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {formatFullDateTime(saleDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Acciones</h3>
            <div className="space-y-3">
              <button
                onClick={handlePrint}
                disabled={printing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <PrinterIcon className="w-5 h-5" />
                {printing ? 'Preparando...' : 'Imprimir Recibo'}
              </button>
              {sale.status === 'ACTIVE' && (
                <button
                  onClick={async () => {
                    if (window.confirm('¿Estás seguro de cancelar esta venta?')) {
                      try {
                        await SaleService.cancel(sale.id)
                        alert('Venta cancelada correctamente')
                        navigate('/sales')
                      } catch (error) {
                        alert('Error al cancelar la venta')
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Cancelar Venta
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detalle de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Productos Vendidos</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  {productCount} producto{productCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.products?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 px-6 text-center">
                        <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg font-medium">
                          No hay productos en esta venta
                        </p>
                      </td>
                    </tr>
                  ) : (
                    sale.products?.map((product, index) => {
                      const productSubtotal = product.price_at_sale * product.quantity
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center mr-3">
                                <span className="font-bold text-purple-600">
                                  {product.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {product.product_id} • Item #{index + 1}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-800">
                                Bs {formatPrice(product.price_at_sale)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-lg font-bold text-gray-800">
                                {product.quantity}
                              </span>
                              <span className="text-sm text-gray-500">unidades</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <ReceiptPercentIcon className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-lg text-green-600">
                                Bs {formatPrice(productSubtotal)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer con totales */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <div className="w-full md:w-2/3 lg:w-1/2">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">Bs {formatPrice(subtotal)}</span>
                    </div>
                    {/* Si hay descuentos o impuestos se pueden agregar aquí */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 text-lg">Total:</span>
                        <span className="font-bold text-2xl text-purple-600">
                          Bs {formatPrice(sale.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nota para impresión */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl print:hidden">
            <div className="flex items-start gap-3">
              <PrinterIcon className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-1">Para imprimir el recibo</p>
                <p className="text-sm text-amber-700">
                  Use el botón "Imprimir Recibo" en la sección de información. 
                  La vista previa de impresión mostrará un formato limpio para entregar al cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .bg-white {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          
          button, .print-button {
            display: none !important;
          }
          
          .receipt-header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid #000;
            padding-bottom: 1rem;
          }
          
          .receipt-footer {
            margin-top: 2rem;
            border-top: 2px dashed #000;
            padding-top: 1rem;
            text-align: center;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}