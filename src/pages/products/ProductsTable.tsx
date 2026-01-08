import type { Product } from '../../types/Product'
import { 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface Props {
  title: string
  products: Product[]
  onEdit?: (product: Product) => void
  onDelete?: (id: number, productName: string) => void
}

export default function ProductsTable({
  title,
  products,
  onEdit,
  onDelete
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            ✓ Activos
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
                Precio
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
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 px-6 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <TagIcon className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">
                      No hay productos activos
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                        <TagIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {product.id} • 
                          Actualizado: {new Date( product.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-purple-600 text-lg">
                        Bs {typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {product.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                        <XCircleIcon className="w-3.5 h-3.5" />
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-1.5">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(product)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                          title="Editar producto"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(product.id, product.name)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-sm active:scale-95"
                          title="Eliminar producto"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}