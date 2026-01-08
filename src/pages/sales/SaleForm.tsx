import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SaleService from '../../services/sale.service'
import ProductService from '../../services/product.service'
import type { Product } from '../../types/Product'
import { 
  ShoppingCartIcon, 
  PlusCircleIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  TagIcon,
  CalculatorIcon,
  ReceiptPercentIcon,
  MagnifyingGlassIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface SaleItem {
  product_id: number | null
  product_name: string
  quantity: number
  price_at_sale: number
}

export default function SaleForm() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<SaleItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductList, setShowProductList] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const data = await ProductService.getAll()
        // Filtrar solo productos activos
        const activeProducts = data.filter(p => p.active)
        setProducts(activeProducts)
        setFilteredProducts(activeProducts)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Cerrar lista de productos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.id.toString().includes(term)
      )
      setFilteredProducts(filtered)
    }
    setShowProductList(true)
  }

  const addProduct = (product?: Product) => {
    if (product) {
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price_at_sale: product.price
      }
      setItems([...items, newItem])
      setSearchTerm('')
      setShowProductList(false)
    } else if (searchTerm.trim()) {
      // Buscar producto por nombre
      const foundProduct = products.find(p => 
        p.name.toLowerCase() === searchTerm.toLowerCase().trim()
      )
      if (foundProduct) {
        const newItem: SaleItem = {
          product_id: foundProduct.id,
          product_name: foundProduct.name,
          quantity: 1,
          price_at_sale: foundProduct.price
        }
        setItems([...items, newItem])
        setSearchTerm('')
        setShowProductList(false)
      }
    }
  }

  const removeProduct = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const updateItem = (index: number, updates: Partial<SaleItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    setItems(newItems)
  }

  const formatPrice = (price: number): string => {
    // Formatear precio con 2 decimales sin toFixed
    const rounded = Math.round(price * 100) / 100
    const integerPart = Math.floor(rounded)
    const decimalPart = Math.round((rounded - integerPart) * 100)
    
    if (decimalPart === 0) {
      return `${integerPart}.00`
    } else if (decimalPart < 10) {
      return `${integerPart}.0${decimalPart}`
    }
    return `${integerPart}.${decimalPart}`
  }

  const calculateTotal = (): number => {
    return items.reduce((total, item) => {
      return total + (item.price_at_sale * item.quantity)
    }, 0)
  }

  const validateForm = (): boolean => {
    return items.length > 0 && items.every(item => 
      item.product_id && item.quantity > 0
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Por favor agregue al menos un producto con cantidad válida')
      return
    }

    // Preparar datos para enviar
    const saleData = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale
    }))

    setSubmitting(true)
    try {
      await SaleService.create(saleData)
      alert('Venta registrada exitosamente')
      navigate('/sales')
    } catch (error: any) {
      console.error('Error creating sale:', error)
      alert(`Error al registrar venta: ${error.response?.data?.message || error.message || 'Error desconocido'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  const total = calculateTotal()
  const canSubmit = validateForm()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Nueva Venta</h1>
              <p className="text-gray-600 mt-1">Registra una nueva venta en el sistema</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/sales')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de productos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Productos de la Venta</h2>
              <div className="text-sm text-gray-500">
                {items.length} producto(s) agregado(s)
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-8">
                <TagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No hay productos disponibles</h3>
                <p className="text-gray-500 mb-4">No se encontraron productos activos para vender.</p>
                <button
                  onClick={() => navigate('/products')}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Ir a Productos →
                </button>
              </div>
            ) : (
              <>
                {/* Buscador de productos */}
                <div className="mb-6" ref={searchRef}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar producto por nombre o ID..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => setShowProductList(true)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setFilteredProducts(products)
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Lista de productos sugeridos */}
                  {showProductList && filteredProducts.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-600">
                              Bs {formatPrice(product.price)}
                            </p>
                            <p className="text-xs text-gray-400">Haga clic para agregar</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Botón para agregar producto manualmente */}
                  {searchTerm && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => addProduct()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        Agregar "{searchTerm}" como nuevo producto
                      </button>
                    </div>
                  )}
                </div>

                {/* Lista de productos agregados */}
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No hay productos en la venta</h3>
                      <p className="text-gray-500">Busque y agregue productos usando el buscador arriba</p>
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{item.product_name}</h3>
                            <p className="text-sm text-gray-500">Precio: Bs {formatPrice(item.price_at_sale)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeProduct(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Cantidad */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cantidad
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateItem(index, { 
                                  quantity: Math.max(1, item.quantity - 1) 
                                })}
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg">-</span>
                              </button>
                              <input
                                type="number"
                                min="1"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  updateItem(index, { quantity: Math.max(1, value) })
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateItem(index, { quantity: item.quantity + 1 })}
                                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-lg">+</span>
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-bold text-xl text-green-600">
                                Bs {formatPrice(item.price_at_sale * item.quantity)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                              {item.quantity} × Bs {formatPrice(item.price_at_sale)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Resumen y total */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen de Venta</h2>
            
            {/* Detalle de productos */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
              <h3 className="font-medium text-gray-700">Productos agregados:</h3>
              {items.map((item, index) => {
                const subtotal = item.price_at_sale * item.quantity
                
                return (
                  <div key={index} className="pb-3 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × Bs {formatPrice(item.price_at_sale)}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-800 whitespace-nowrap ml-4">
                        Bs {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">Item #{index + 1}</span>
                      <button
                        onClick={() => removeProduct(index)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {items.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay productos seleccionados</p>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800 text-lg">Total a Pagar:</span>
                <span className="font-bold text-3xl text-purple-600">
                  Bs {formatPrice(total)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <ReceiptPercentIcon className="w-4 h-4" />
                  <span>{items.length} producto(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4" />
                  <span>{items.reduce((sum, item) => sum + item.quantity, 0)} unidades</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-3.5 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    Registrar Venta
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigate('/sales')}
                disabled={submitting}
                className="w-full px-4 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              
              {items.length > 0 && (
                <button
                  onClick={() => setItems([])}
                  disabled={submitting}
                  className="w-full px-4 py-3.5 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Limpiar Todo
                </button>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="bg-blue-50 rounded-xl p-5">
            <h4 className="font-medium text-blue-800 mb-2">💡 Instrucciones Rápidas</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <MagnifyingGlassIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Busque productos por nombre o ID</span>
              </li>
              <li className="flex items-start gap-2">
                <PlusCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Haga clic en un producto para agregarlo</span>
              </li>
              <li className="flex items-start gap-2">
                <CalculatorIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Ajuste la cantidad con los botones +/-</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Revise el total y confirme la venta</span>
              </li>
            </ul>
          </div>

          {/* Estadísticas rápidas */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-medium text-gray-700 mb-3">📊 Estadísticas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos disponibles:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En esta venta:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unidades totales:</span>
                <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}