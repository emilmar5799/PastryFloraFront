import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Order } from '../../types/order';
import { OrderService } from '../../services/order.service';
import { useModal } from '../../hooks/useModal';
import Modal, { ModalButtons } from '../../components/ui/Modal';
import {
  ArrowLeftIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  TruckIcon,
  SparklesIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CakeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    modalConfig, 
    isModalOpen, 
    isLoading, 
    showModal, 
    hideModal, 
    handleConfirm 
  } = useModal();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getById(Number(id));
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'DONE':
        return { 
          icon: CheckCircleIcon, 
          color: 'text-green-500', 
          bg: 'bg-green-100',
          text: 'Listo',
          nextAction: 'DELIVERED' as Order['status'] // Añadir aserción de tipo
        };
      case 'DELIVERED':
        return { 
          icon: TruckIcon, 
          color: 'text-blue-500', 
          bg: 'bg-blue-100',
          text: 'Entregado',
          nextAction: 'FINISHED' as Order['status'] // Añadir aserción de tipo
        };
      case 'FINISHED':
        return { 
          icon: SparklesIcon, 
          color: 'text-purple-500', 
          bg: 'bg-purple-100',
          text: 'Finalizado',
          nextAction: null
        };
      case 'FAILED':
        return { 
          icon: XCircleIcon, 
          color: 'text-red-500', 
          bg: 'bg-red-100',
          text: 'Fallido',
          nextAction: null
        };
      default:
        return { 
          icon: ClockIcon, 
          color: 'text-amber-500', 
          bg: 'bg-amber-100',
          text: 'Pendiente',
          nextAction: 'DONE' as Order['status'] // Añadir aserción de tipo
        };
    }
  };

  const getTypeInfo = (type: Order['type']) => {
    return type === 'LARGE' 
      ? { text: 'Grande (Evento Especial)', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' }
      : { text: 'Pequeño', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' };
  };

  const formatPrice = (price?: number): string => {
    if (!price) return '0.00';
    const rounded = Math.round(price * 100) / 100;
    const integerPart = Math.floor(rounded);
    const decimalPart = Math.round((rounded - integerPart) * 100);
    
    if (decimalPart === 0) return `${integerPart}.00`;
    if (decimalPart < 10) return `${integerPart}.0${decimalPart}`;
    return `${integerPart}.${decimalPart}`;
  };

  // Función para formatear fecha y hora completa
  const formatFullDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para formatear fecha y hora para display
  const formatDateTimeForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener tiempo relativo
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `En ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `En ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else if (diffMs > 0) {
      return 'Hoy';
    } else {
      return 'Pasado';
    }
  };

  const handleUpdateStatus = (newStatus: Order['status']) => {
    let action: () => Promise<void>;
    let title = '';
    let message = '';

    switch (newStatus) {
      case 'FAILED':
        action = () => OrderService.markAsFailed(order!.id);
        title = 'Marcar como Fallido';
        message = `¿Estás seguro de marcar el pedido #${order!.id} como fallido?`;
        break;
      case 'DONE':
        action = () => OrderService.markAsDone(order!.id);
        title = 'Marcar como Listo';
        message = `¿Estás seguro de marcar el pedido #${order!.id} como listo para entrega?`;
        break;
      case 'DELIVERED':
        action = () => OrderService.markAsDelivered(order!.id);
        title = 'Marcar como Entregado';
        message = `¿Estás seguro de marcar el pedido #${order!.id} como entregado?`;
        break;
      case 'FINISHED':
        action = () => OrderService.markAsFinished(order!.id);
        title = 'Marcar como Finalizado';
        message = `¿Estás seguro de marcar el pedido #${order!.id} como finalizado?`;
        break;
      default:
        return;
    }

    showModal({
      title,
      message,
      type: newStatus === 'FAILED' ? 'danger' : 'warning',
      confirmText: 'Sí, continuar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await action();
          await loadOrder();
        } catch (error) {
          console.error('Error updating status:', error);
        }
      }
    });
  };

  const handleDelete = () => {
    showModal({
      title: 'Eliminar Pedido',
      message: `¿Estás seguro de eliminar el pedido #${order!.id} de ${order!.customer_name}? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      showCancel: true,
      onConfirm: async () => {
        try {
          await OrderService.remove(order!.id);
          navigate('/orders');
        } catch (error) {
          console.error('Error deleting order:', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Pedido no encontrado</h3>
          <p className="text-gray-500 mb-4">El pedido que buscas no existe o fue eliminado.</p>
          <button
            onClick={() => navigate('/orders')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Volver a Pedidos
          </button>
        </div>
      </div>
    );
  }

  const deliveryDate = order.delivery_datetime;
  const createdDate = order.created_at;
  const statusInfo = getStatusInfo(order.status);
  const typeInfo = getTypeInfo(order.type);
  const StatusIcon = statusInfo.icon;

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
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Pedido #{order.id}
              </h1>
              <p className="text-gray-600 mt-1">
                {typeInfo.text} • {order.customer_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/orders/${order.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del pedido */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Detalles del Pedido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información del cliente */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  Información del Cliente
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <span className="font-semibold">{order.customer_name}</span>
                  </div>
                  {order.customer_ci && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">CI:</span>
                      <span className="font-mono">{order.customer_ci}</span>
                    </div>
                  )}
                  {order.phone && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Teléfono:</span>
                      </div>
                      <a 
                        href={`tel:${order.phone}`}
                        className="font-semibold text-primary hover:text-primaryDark"
                      >
                        {order.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de entrega */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                  Información de Entrega
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-blue-500" />
                      <span className="font-bold text-blue-800">Fecha y Hora de Entrega</span>
                    </div>
                    <p className="text-lg font-semibold">{formatFullDateTime(deliveryDate)}</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {getTimeAgo(deliveryDate)} • {formatDateTimeForDisplay(deliveryDate)}
                    </p>
                  </div>
                  
                  {order.color && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <TagIcon className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-700">Color:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: order.color }}
                          />
                          <span className="font-semibold">{order.color}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.event && order.type === 'LARGE' && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2">
                        <CakeIcon className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-purple-800">Evento:</span>
                      </div>
                      <p className="font-bold text-purple-700 mt-1">{order.event}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            {order.specifications && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                  Especificaciones
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{order.specifications}</p>
                </div>
              </div>
            )}

            {/* Información adicional para pedidos grandes */}
            {order.type === 'LARGE' && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.pieces && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-purple-800">Cantidad de piezas:</span>
                      <span className="font-bold text-xl text-purple-600">{order.pieces}</span>
                    </div>
                  </div>
                )}
                
                {order.warranty && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2">
                      <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-blue-800">Garantía:</span>
                    </div>
                    <p className="mt-2 text-blue-700">{order.warranty}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Estado y acciones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Estado y acciones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Estado y Acciones</h2>
            
            {/* Estado actual */}
            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                  <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado actual</p>
                  <p className="font-bold text-lg">{statusInfo.text}</p>
                </div>
              </div>
            </div>

            {/* Tipo de pedido */}
            <div className="mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${typeInfo.color}`}>
                {typeInfo.text}
              </span>
            </div>

            {/* Información financiera */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-800">Anticipo:</span>
                  </div>
                  <span className="font-bold text-xl text-green-600">
                    Bs {formatPrice(order.advance)}
                  </span>
                </div>
                {order.price && (
                  <div className="flex justify-between items-center pt-2 border-t border-green-200">
                    <span className="text-green-700">Precio total:</span>
                    <span className="font-bold text-green-800">
                      Bs {formatPrice(order.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones de estado */}
            <div className="space-y-3">
              {statusInfo.nextAction && (
                <button
                  onClick={() => handleUpdateStatus(statusInfo.nextAction!)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  {statusInfo.nextAction === 'DONE' && <CheckCircleIcon className="w-5 h-5" />}
                  {statusInfo.nextAction === 'DELIVERED' && <TruckIcon className="w-5 h-5" />}
                  {statusInfo.nextAction === 'FINISHED' && <SparklesIcon className="w-5 h-5" />}
                  {statusInfo.nextAction === 'DONE' && 'Marcar como Listo'}
                  {statusInfo.nextAction === 'DELIVERED' && 'Marcar como Entregado'}
                  {statusInfo.nextAction === 'FINISHED' && 'Marcar como Finalizado'}
                </button>
              )}

              {order.status !== 'FAILED' && order.status !== 'FINISHED' && (
                <button
                  onClick={() => handleUpdateStatus('FAILED')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                  Marcar como Fallido
                </button>
              )}

              <button
                onClick={handleDelete}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Eliminar Pedido
              </button>
            </div>
          </div>

          {/* Información de creación */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Información del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Creado:</span>
                <span className="text-sm font-medium">{formatDateTimeForDisplay(createdDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sucursal:</span>
                <span className="text-sm font-medium">{order.branch_id === 1 ? 'Flora 13' : 'Flora 8'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ID Interno:</span>
                <span className="text-sm font-mono">{order.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}