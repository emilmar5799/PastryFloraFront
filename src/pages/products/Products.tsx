import { useEffect, useState } from 'react'
import ProductService from '../../services/product.service'
import type { Product } from '../../types/Product'
import ProductsTable from './ProductsTable'
import ProductForm from './ProductForm'
import { useModal } from '../../hooks/useModal'
import Modal, { ModalButtons } from '../../components/ui/Modal'
import { 
  CubeIcon, 
  PlusCircleIcon, 
  ArrowPathIcon,
   
} from '@heroicons/react/24/outline'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // Usamos el hook de modal
  const { 
    modalConfig, 
    isModalOpen, 
    isLoading, 
    showModal, 
    hideModal, 
    handleConfirm 
  } = useModal()

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await ProductService.getAll()
      setProducts(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      showModal({
        title: 'Error',
        message: `Error al cargar productos: ${message}`,
        type: 'danger',
        confirmText: 'Reintentar',  
        showCancel: false,
        onConfirm: loadProducts
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleSave = async (data: { name: string; price: number }) => {
    try {
      if (selected) {
        await ProductService.update(selected.id, data)
        showModal({
          title: 'Producto Actualizado',
          message: `El producto "${data.name}" ha sido actualizado correctamente.`,
          type: 'success',
          confirmText: 'Aceptar',
          showCancel: false,
          onConfirm: () => {
            setShowForm(false)
            setSelected(null)
            loadProducts()
          }
        })
      } else {
        await ProductService.create(data)
        showModal({
          title: 'Producto Creado',
          message: `El producto "${data.name}" ha sido creado correctamente.`,
          type: 'success',
          confirmText: 'Aceptar',
          showCancel: false,
          onConfirm: () => {
            setShowForm(false)
            loadProducts()
          }
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      showModal({
        title: 'Error',
        message: `Error al guardar producto: ${message}`,
        type: 'danger',
        confirmText: 'Aceptar',
        showCancel: false
      })
    }
  }

  const handleDelete = (id: number, productName: string) => {
    showModal({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de eliminar el producto "${productName}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Eliminar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await ProductService.remove(id)
          showModal({
            title: 'Producto Eliminado',
            message: `El producto "${productName}" ha sido eliminado correctamente.`,
            type: 'success',
            confirmText: 'Aceptar',
            showCancel: false,
            onConfirm: loadProducts
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error desconocido'
          showModal({
            title: 'Error',
            message: `Error al eliminar producto: ${message}`,
            type: 'danger',
            confirmText: 'Reintentar',
            showCancel: true,
            onConfirm: () => handleDelete(id, productName)
          })
        }
      }
    })
  }

  // Solo mostramos productos activos (los eliminados no se ven)
  const activeProducts = products.filter(p => p.active)

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
              <CubeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
              <p className="text-gray-600 mt-1">Administra el catálogo de productos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadProducts}
              disabled={loading || isLoading}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <p className="text-sm text-gray-600">Productos activos</p>
                  <p className="text-2xl font-bold text-gray-800">{activeProducts.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total registrados</p>
                  <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <PlusCircleIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-purple-50 rounded-xl p-5">
            <h4 className="font-medium text-purple-800 mb-2">💡 Información</h4>
            <ul className="text-sm text-purple-700 space-y-2">
              <li>• Los productos eliminados no aparecen en la lista</li>
              <li>• El precio debe ser en Bolivianos (Bs)</li>
              <li>• Solo puedes editar productos activos</li>
              <li>• La eliminación es permanente</li>
            </ul>
          </div>
        </div>

        {/* Formulario y Tablas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Botón para mostrar formulario */}
          {!showForm && !selected && (
            <button
              onClick={() => {
                setSelected(null)
                setShowForm(true)
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-4 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <PlusCircleIcon className="w-6 h-6" />
              <span>Nuevo Producto</span>
            </button>
          )}

          {/* Formulario (visible al crear o editar) */}
          {(showForm || selected) && (
            <ProductForm
              product={selected}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setSelected(null)
              }}
            />
          )}

          {/* Loading state */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : (
            <>
              {/* Tabla de productos activos */}
              {activeProducts.length > 0 && (
                <ProductsTable
                  title="Productos Activos"
                  products={activeProducts}
                  onEdit={(p) => {
                    setSelected(p)
                    setShowForm(true)
                  }}
                  onDelete={(id, productName) => handleDelete(id, productName)}
                />
              )}

              {/* Mensaje cuando no hay productos */}
              {activeProducts.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CubeIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No hay productos activos</h3>
                  <p className="text-gray-500 mb-6">
                    {products.length > 0 
                      ? 'Todos los productos han sido eliminados. Agrega nuevos productos al catálogo.'
                      : 'Comienza agregando tu primer producto para el catálogo.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      setSelected(null)
                      setShowForm(true)
                    }}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                  >
                    <PlusCircleIcon className="w-5 h-5 inline mr-2" />
                    {products.length > 0 ? 'Agregar Nuevo Producto' : 'Crear Primer Producto'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}