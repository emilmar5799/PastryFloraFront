// pages/RefillDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import Modal, { ModalButtons } from '../../components/ui/Modal';
import type { Order } from '../../types/order';
import type { OrderProductWithDetails } from '../../services/orderProduct.service';
import { OrderService } from '../../services/order.service';
import { OrderProductService } from '../../services/orderProduct.service';
import { 
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  CakeIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function RefillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { modalConfig, isModalOpen, isLoading, showModal, hideModal, handleConfirm } = useModal();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<OrderProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = role === 'ADMIN' || role === 'SUPERVISOR';

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const [orderData, productsData] = await Promise.all([
        OrderService.getById(Number(id)),
        OrderProductService.getByOrderId(Number(id))
      ]);
      
      // Verificar que sea un pedido grande
      if (orderData.type !== 'LARGE') {
        setError('Este no es un pedido grande');
        navigate('/refill');
        return;
      }
      
      setOrder(orderData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos del pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleDeleteProduct = (productId: number, productName: string) => {
    showModal({
      title: 'Eliminar Producto',
      message: `¿Estás seguro de eliminar "${productName}" del pedido?`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await OrderProductService.deleteProduct(productId);
          await loadData();
        } catch (error) {
          console.error('Error deleting product:', error);
        }
      }
    });
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const calculateTotalQuantity = () => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CakeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Pedido no encontrado</h3>
          <p className="text-gray-500 mb-4">{error || 'El pedido que buscas no existe'}</p>
          <Link
            to="/refill"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Volver a Preparación
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal */}
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
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CakeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Pedido #{order.id} - {order.event || 'Evento'}
              </h1>
              <p className="text-gray-600 mt-1">
                {order.customer_name} • {formatDate(order.delivery_datetime)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Pedido Grande
                </span>
                {!canEdit && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Solo vista
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <Link
                to={`/refill/${order.id}/add-products`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Agregar Productos
              </Link>
            )}
            <Link
              to="/refill"
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del pedido */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Información del Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">{order.customer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Entrega</p>
                  <p className="font-semibold">{formatDate(order.delivery_datetime)}</p>
                </div>
              </div>

              {order.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-semibold">{order.phone}</p>
                  </div>
                </div>
              )}

              {order.event && (
                <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CakeIcon className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-orange-800">Evento:</span>
                  </div>
                  <p className="font-semibold text-orange-700">{order.event}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de productos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Resumen de Productos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-700">Total productos:</span>
                <span className="font-bold text-blue-800">{calculateTotalQuantity()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Valor total:</span>
                <span className="font-bold text-green-800">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-orange-700">Productos únicos:</span>
                <span className="font-bold text-orange-800">{products.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Productos del Pedido</h2>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {products.length} producto{products.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    No hay productos asignados a este pedido
                  </p>
                  {canEdit && (
                    <Link
                      to={`/refill/${order.id}/add-products`}
                      className="text-orange-600 hover:text-orange-700 font-medium mt-2 inline-block"
                    >
                      Agregar primer producto →
                    </Link>
                  )}
                </div>
              ) : (
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
                      {canEdit && (
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map(product => {
                      const subtotal = product.price * product.quantity;
                      
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-3">
                                <CakeIcon className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">ID: {product.product_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium">{formatCurrency(product.price)}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {product.quantity} unidad{product.quantity !== 1 ? 'es' : ''}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-bold text-green-600">
                                {formatCurrency(subtotal)}
                              </span>
                            </div>
                          </td>
                          {canEdit && (
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/refill/${order.id}/edit-product/${product.id}`}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar cantidad"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </Link>
                                <button
                                  onClick={() => handleDeleteProduct(product.id, product.name || 'Producto')}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar producto"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    
                    {/* Total */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-4 px-6 text-right" colSpan={canEdit ? 3 : 2}>
                        <span className="text-gray-700">TOTAL:</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                          <span className="text-xl font-bold text-green-700">
                            {formatCurrency(calculateTotal())}
                          </span>
                        </div>
                      </td>
                      {canEdit && <td className="py-4 px-6"></td>}
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Notas importantes */}
          <div className="mt-6 bg-blue-50 rounded-xl p-5">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />
              Información Importante
            </h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Los productos listados aquí son para <strong>preparación</strong></li>
              <li>• Verifica las cantidades antes de comenzar la preparación</li>
              <li>• Los precios mostrados son <strong>unitarios</strong></li>
              {!canEdit && (
                <li>• <strong>Solo lectura:</strong> Contacta a un supervisor para modificaciones</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}