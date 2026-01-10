// pages/RefillForm.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../hooks/useModal';
import Modal, { ModalButtons } from '../../components/ui/Modal';
import type { Product } from '../../types/Product';
import type { OrderProductWithDetails } from '../../services/orderProduct.service';
import ProductService  from '../../services/product.service';
import { OrderProductService } from '../../services/orderProduct.service';
import { OrderService } from '../../services/order.service';
import { 
  ArrowLeftIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  CakeIcon,
  UserIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function RefillFormPage() {
  const { id, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { modalConfig, isModalOpen, isLoading, showModal, hideModal, handleConfirm } = useModal();
  
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product_id: number;
    quantity: number;
    name: string;
    price: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<OrderProductWithDetails | null>(null);

  const isEditMode = !!productId;
  const canEdit = role === 'ADMIN' || role === 'SUPERVISOR';

  useEffect(() => {
    if (!canEdit) {
      navigate('/refill');
      return;
    }
    
    loadData();
  }, [id, productId]);

  const loadData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Cargar datos del pedido
      const orderData = await OrderService.getById(Number(id));
      
      // Verificar que sea un pedido grande
      if (orderData.type !== 'LARGE') {
        setError('Este no es un pedido grande');
        navigate('/refill');
        return;
      }
      
      setOrder(orderData);

      // Cargar productos disponibles
      const productsData = await ProductService.getAll();
      setProducts(productsData.filter(p => p.active !== false));

      // Si estamos editando, cargar el producto existente
      if (isEditMode && productId) {
        const existingProducts = await OrderProductService.getByOrderId(Number(id));
        const productToEdit = existingProducts.find(p => p.id === Number(productId));
        
        if (productToEdit) {
          setEditingProduct(productToEdit);
          setSelectedProducts([{
            product_id: productToEdit.product_id,
            quantity: productToEdit.quantity,
            name: productToEdit.name,
            price: productToEdit.price
          }]);
        } else {
          setError('Producto no encontrado');
          navigate(`/refill/${id}`);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: Product) => {
    // Verificar si el producto ya está seleccionado
    const existingIndex = selectedProducts.findIndex(p => p.product_id === product.id);
    
    if (existingIndex >= 0) {
      // Si ya existe, incrementar cantidad
      const updated = [...selectedProducts];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      };
      setSelectedProducts(updated);
    } else {
      // Si no existe, agregar nuevo
      setSelectedProducts([
        ...selectedProducts,
        {
          product_id: product.id,
          quantity: 1,
          name: product.name,
          price: product.price
        }
      ]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveProduct(productId);
      return;
    }
    
    setSelectedProducts(selectedProducts.map(p => 
      p.product_id === productId 
        ? { ...p, quantity: newQuantity }
        : p
    ));
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      setError('Debe seleccionar al menos un producto');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isEditMode && editingProduct) {
        // Modo edición: actualizar solo un producto
        await OrderProductService.updateQuantity(
          editingProduct.id,
          selectedProducts[0].quantity
        );
      } else {
        // Modo creación: agregar productos
        const productsToAdd = selectedProducts.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        }));
        
        await OrderProductService.addProducts(Number(id), {
          products: productsToAdd
        });
      }

      // Mostrar mensaje de éxito
      showModal({
        title: isEditMode ? 'Producto Actualizado' : 'Productos Agregados',
        message: isEditMode 
          ? 'La cantidad del producto ha sido actualizada correctamente.'
          : 'Los productos han sido agregados al pedido correctamente.',
        type: 'success',
        confirmText: 'Continuar',
        showCancel: false,
        onConfirm: () => {
          navigate(`/refill/${id}`);
        }
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError(error.response?.data?.message || 'Error al guardar los productos');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
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

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Acceso denegado</h3>
          <p className="text-gray-500 mb-4">No tienes permisos para gestionar productos.</p>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isEditMode ? 'Cargando producto...' : 'Cargando productos disponibles...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error || 'Pedido no encontrado'}</p>
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
              <ShoppingCartIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditMode ? 'Editar Producto' : 'Agregar Productos'} - Pedido #{order.id}
              </h1>
              <p className="text-gray-600 mt-1">
                {order.customer_name} • {order.event || 'Evento'} • {formatDate(order.delivery_datetime)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {isEditMode ? 'Modo Edición' : 'Agregando Productos'}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {role}
                </span>
              </div>
            </div>
          </div>
          <Link
            to={`/refill/${id}`}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Cancelar
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos disponibles */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Productos Disponibles {isEditMode && '(Edición)'}
            </h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 font-medium mb-2">Editando producto:</p>
                  <p className="font-bold text-blue-800">{editingProduct?.name}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Precio unitario: {formatCurrency(editingProduct?.price || 0)}
                  </p>
                </div>
                
                <div className="p-4 bg-white border border-gray-300 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleUpdateQuantity(selectedProducts[0]?.product_id, (selectedProducts[0]?.quantity || 1) - 1)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <MinusCircleIcon className="w-6 h-6" />
                    </button>
                    
                    <input
                      type="number"
                      min="1"
                      value={selectedProducts[0]?.quantity || 1}
                      onChange={(e) => handleUpdateQuantity(selectedProducts[0]?.product_id, parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-bold"
                    />
                    
                    <button
                      onClick={() => handleUpdateQuantity(selectedProducts[0]?.product_id, (selectedProducts[0]?.quantity || 1) + 1)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                    >
                      <PlusCircleIcon className="w-6 h-6" />
                    </button>
                    
                    <span className="text-gray-600 ml-4">
                      Subtotal: <span className="font-bold text-green-600">
                        {formatCurrency((selectedProducts[0]?.price || 0) * (selectedProducts[0]?.quantity || 1))}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="p-4 border border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-all cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">ID: {product.id}</span>
                      <div className="flex items-center gap-2 text-orange-600">
                        <PlusCircleIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Agregar</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isEditMode && products.length === 0 && (
              <div className="text-center py-8">
                <CakeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">No hay productos disponibles</p>
                <p className="text-gray-500">Debes crear productos primero en la sección de productos.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen y acciones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Resumen del Pedido</h3>
            <div className="space-y-3">
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
              
              {order.event && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <CakeIcon className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-orange-800">Evento:</span>
                  </div>
                  <p className="font-bold text-orange-700 mt-1">{order.event}</p>
                </div>
              )}
            </div>
          </div>

          {/* Productos seleccionados */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Productos Seleccionados</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {selectedProducts.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No hay productos seleccionados</p>
                <p className="text-gray-500 text-sm mt-1">
                  {isEditMode ? 'Ajusta la cantidad' : 'Selecciona productos de la lista'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {selectedProducts.map(product => (
                  <div key={product.product_id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)} c/u
                        </p>
                      </div>
                      {!isEditMode && (
                        <button
                          onClick={() => handleRemoveProduct(product.product_id)}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isEditMode && (
                          <>
                            <button
                              onClick={() => handleUpdateQuantity(product.product_id, product.quantity - 1)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                              <MinusCircleIcon className="w-4 h-4" />
                            </button>
                            <span className="px-2 font-medium">{product.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(product.product_id, product.quantity + 1)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                            >
                              <PlusCircleIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {isEditMode && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {product.quantity} unidad{product.quantity !== 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      
                      <span className="font-bold text-green-600">
                        {formatCurrency(product.price * product.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">TOTAL:</span>
                    <span className="text-xl font-bold text-green-700">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedProducts.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  {isEditMode ? 'Actualizar Producto' : 'Agregar al Pedido'}
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              {isEditMode 
                ? 'La cantidad modificada se actualizará en el pedido.'
                : 'Los productos seleccionados se agregarán al pedido.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}