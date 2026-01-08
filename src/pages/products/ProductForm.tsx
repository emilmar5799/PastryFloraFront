import { useEffect, useState } from 'react'
import type { Product } from '../../types/Product'
import { XMarkIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline'

interface Props {
  product: Product | null
  onSave: (data: { name: string; price: number }) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  useEffect(() => {
    if (product) {
      setName(product.name)
      setPrice(product.price.toString())
    } else {
      setName('')
      setPrice('')
    }
    setErrors({})
  }, [product])

  const validateForm = () => {
    const newErrors: { name?: string; price?: string } = {}

    // Validar nombre
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres'
    }

    // Validar precio
    if (!price.trim()) {
      newErrors.price = 'El precio es requerido'
    } else {
      const priceNum = parseFloat(price.replace(',', '.'))
      if (isNaN(priceNum)) {
        newErrors.price = 'Ingresa un número válido'
      } else if (priceNum < 0) {
        newErrors.price = 'El precio no puede ser negativo'
      } else if (priceNum > 999999.99) {
        newErrors.price = 'El precio es demasiado alto'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const priceNum = parseFloat(price.replace(',', '.'))
    setLoading(true)
    try {
      await onSave({ name: name.trim(), price: priceNum })
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Permitir solo números, punto y coma
    value = value.replace(/[^0-9.,]/g, '')
    
    // Reemplazar coma por punto para validación
    const normalizedValue = value.replace(',', '.')
    
    // Validar que solo tenga un punto decimal
    const parts = normalizedValue.split('.')
    if (parts.length > 2) {
      // Si hay más de un punto, mantener solo el primero
      value = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2)
    }
    
    setPrice(value)
    
    // Limpiar error si se corrige
    if (errors.price && value) {
      const priceNum = parseFloat(normalizedValue)
      if (!isNaN(priceNum) && priceNum >= 0) {
        setErrors(prev => ({ ...prev, price: undefined }))
      }
    }
  }

  const formatPriceDisplay = (value: string) => {
    if (!value) return '0.00'
    
    const num = parseFloat(value.replace(',', '.'))
    return isNaN(num) ? '0.00' : num.toFixed(2)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TagIcon className="w-7 h-7" />
            <h2 className="text-xl font-bold">
              {product ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          {product ? 'Modifica los datos del producto' : 'Completa los datos para agregar un nuevo producto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-5">
          {/* Nombre del producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Ej: Torta de Chocolate, Pastel de Zanahoria, etc."
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, name: undefined }))
                  }
                }}
                required
                disabled={loading}
                maxLength={100}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Máximo 100 caracteres
              </p>
              <span className="text-xs text-gray-400">
                {name.length}/100
              </span>
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio (Bolivianos) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-right font-mono ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                value={price}
                onChange={handlePriceChange}
                required
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">Bs</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Usa punto o coma para decimales (ej: 25.50 o 25,50)
              </p>
              {price && (
                <span className="text-xs font-medium text-purple-600">
                  Bs {formatPriceDisplay(price)}
                </span>
              )}
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
        </div>

        {/* Preview */}
        {(name || price) && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">{name || '[Nombre del producto]'}</span>
                {name.length > 30 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {name.substring(0, 30)}...
                  </p>
                )}
              </div>
              <span className="font-bold text-purple-600 text-lg">
                Bs {formatPriceDisplay(price)}
              </span>
            </div>
          </div>
        )}

        {/* Ejemplos de precios */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-700 mb-2">💡 Ejemplos de precios:</p>
          <div className="grid grid-cols-3 gap-2">
            {['10.50', '25.00', '45.75', '99.99', '150.00', '299.90'].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrice(example)}
                className="text-xs px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Bs {example}
              </button>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim() || !price.trim()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-3.5 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : product ? (
              'Actualizar Producto'
            ) : (
              'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}