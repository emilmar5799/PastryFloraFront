import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Order } from '../../types/order';
import { OrderService } from '../../services/order.service';
import { filterLargeOrders, sortOrdersByDeliveryDate, getOrderStatusText } from '../../utils/orderUtils';
import { 
  CakeIcon, 
  CalendarDaysIcon, 
  UserIcon, 
  ClockIcon,
  ClipboardDocumentListIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TruckIcon,
  SparklesIcon,
  XCircleIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function RefillPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const navigate = useNavigate();
  const { role } = useAuth();

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrderService.getAll();
      // Filtrar solo pedidos grandes
      const largeOrders = filterLargeOrders(data);
      // Ordenar por fecha de entrega (más cercano primero)
      const sortedOrders = sortOrdersByDeliveryDate(largeOrders);
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Función para normalizar fechas (solo fecha, sin hora, en zona horaria local)
  const normalizeDate = (dateString: string | Date): Date => {
    const date = new Date(dateString);
    // Crear nueva fecha solo con año, mes y día en zona horaria local
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Función para formatear fecha en formato YYYY-MM-DD para input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para filtrar por fecha
  const filterByDate = (dateString: string) => {
    if (!dateString) {
      // Si no hay fecha seleccionada, mostrar todos
      setFilteredOrders(orders);
      return;
    }

    // Parsear la fecha del input (viene en formato YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    
    const filtered = orders.filter(order => {
      // Normalizar la fecha del pedido (ignorar hora)
      const orderDateObj = normalizeDate(order.delivery_datetime);
      
      // Comparar año, mes y día
      return orderDateObj.getFullYear() === selectedDateObj.getFullYear() &&
             orderDateObj.getMonth() === selectedDateObj.getMonth() &&
             orderDateObj.getDate() === selectedDateObj.getDate();
    });
    
    setFilteredOrders(filtered);
  };

  // Manejar cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    filterByDate(date);
  };

  // Limpiar filtro
  const clearDateFilter = () => {
    setSelectedDate('');
    setFilteredOrders(orders);
  };

  // Función para obtener la fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    return formatDateForInput(today);
  };

  // Función para obtener la fecha de mañana
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateForInput(tomorrow);
  };

  // Filtros rápidos
  const applyQuickFilter = (daysOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const dateString = formatDateForInput(date);
    setSelectedDate(dateString);
    filterByDate(dateString);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'DONE':
        return { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100' };
      case 'DELIVERED':
        return { icon: TruckIcon, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'FINISHED':
        return { icon: SparklesIcon, color: 'text-purple-500', bg: 'bg-purple-100' };
      case 'FAILED':
        return { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100' };
      default:
        return { icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-100' };
    }
  };

  const getTimeRelative = (dateString: string): string => {
    const date = normalizeDate(dateString);
    const today = normalizeDate(new Date());
    
    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1) return `En ${diffDays} días`;
    if (diffDays < -1) return `Hace ${Math.abs(diffDays)} días`;
    
    return '';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const canEdit = role === 'ADMIN' || role === 'SUPERVISOR';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos grandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CakeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Preparación de Pedidos</h1>
              <p className="text-gray-600 mt-1">
                {canEdit 
                  ? 'Administra productos para pedidos grandes (Eventos)' 
                  : 'Visualiza productos para preparación de pedidos grandes'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Rol: {role === 'REFILL' ? 'Preparación' : role}
                </span>
                {canEdit && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Permisos de edición
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                showDateFilter 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white'
              }`}
              title="Filtrar por fecha"
            >
              <FunnelIcon className="w-6 h-6" />
              {selectedDate && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            <button
              onClick={loadOrders}
              className="p-3 text-gray-600 hover:text-orange-600 hover:bg-white rounded-xl transition-all"
              title="Refrescar lista"
            >
              <ArrowRightIcon className="w-6 h-6 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtro por Fecha */}
      {showDateFilter && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5" />
              Filtrar por Fecha de Entrega
            </h3>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar filtro
                </button>
              )}
              <button
                onClick={() => setShowDateFilter(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro por fecha específica */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar fecha específica
              </label>
              <div className="relative">
                <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  max={getTomorrowDate()} // Opcional: limitar a fechas futuras
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  La fecha se interpreta como fecha local (no UTC)
                </div>
              </div>
            </div>

            {/* Filtros rápidos */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros rápidos
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyQuickFilter(0)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedDate === getTodayDate()
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => applyQuickFilter(1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedDate === getTomorrowDate()
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Mañana
                </button>
                <button
                  onClick={clearDateFilter}
                  className="px-3 py-2 text-sm font-medium bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-all flex items-center justify-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Todos
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Hoy: {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>

            {/* Resumen del filtro */}
            <div className="col-span-full bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Resumen del filtro</h4>
                  <p className="text-sm text-gray-600">
                    {selectedDate 
                      ? `Mostrando pedidos para el ${formatDateForDisplay(selectedDate + 'T00:00:00')}`
                      : 'Mostrando todos los pedidos'}
                  </p>
                  {selectedDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Filtro aplicado: {selectedDate}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Resultados</p>
                  <p className="font-bold text-orange-600">
                    {filteredOrders.length} de {orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-2 text-red-600 hover:text-red-700 font-medium"
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Pedidos Grandes (Eventos)</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
                {selectedDate && ' (filtrados por fecha)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar
                </button>
              )}
              <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 rounded-full text-xs font-semibold">
                Solo LARGE
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <CakeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">
                {selectedDate 
                  ? 'No hay pedidos para la fecha seleccionada'
                  : 'No hay pedidos grandes para preparar'
                }
              </p>
              <p className="text-gray-500 mt-1">
                {selectedDate 
                  ? `No se encontraron pedidos para el ${formatDateForDisplay(selectedDate + 'T00:00:00')}`
                  : 'Los pedidos grandes aparecerán aquí cuando sean creados'
                }
              </p>
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="text-orange-600 hover:text-orange-700 font-medium mt-2"
                >
                  Limpiar filtro para ver todos los pedidos →
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente y Evento
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrega
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map(order => {
                  const statusInfo = getStatusIcon(order.status);
                  const StatusIcon = statusInfo.icon;
                  const timeRelative = getTimeRelative(order.delivery_datetime);
                  const orderDate = normalizeDate(order.delivery_datetime);
                  const today = normalizeDate(new Date());
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mr-3">
                            <UserIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{order.customer_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <CakeIcon className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{order.event || 'Sin evento especificado'}</p>
                            </div>
                            {order.phone && (
                              <p className="text-xs text-gray-500 mt-1">{order.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{formatDate(order.delivery_datetime)}</p>
                            <p className={`text-xs ${
                              orderDate.getTime() === today.getTime() 
                                ? 'text-green-600 font-semibold' 
                                : timeRelative.startsWith('En') 
                                  ? 'text-gray-500' 
                                  : 'text-amber-600'
                            }`}>
                              {timeRelative}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              Fecha real: {orderDate.toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          </div>
                          <span className="text-sm font-medium">{getOrderStatusText(order.status)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <ClipboardDocumentListIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {order.pieces ? `${order.pieces} piezas` : 'Sin productos asignados'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/refill/${order.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                          >
                            {canEdit ? 'Gestionar Productos' : 'Ver Detalles'}
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Información para el usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-5">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-5 h-5" />
            Información de Roles
          </h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>REFILL:</strong> Solo puede ver los productos asignados</li>
            <li>• <strong>SUPERVISOR/ADMIN:</strong> Pueden agregar, editar y eliminar productos</li>
            <li>• Solo aparecen pedidos de tipo <strong>GRANDE (Eventos)</strong></li>
            <li>• Los productos se usan para preparación y control de inventario</li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-xl p-5">
          <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Estados del Pedido
          </h4>
          <ul className="text-sm text-orange-700 space-y-2">
            <li className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span><strong>Pendiente:</strong> En preparación</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span><strong>Listo:</strong> Preparación completada</span>
            </li>
            <li className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-blue-500" />
              <span><strong>Entregado:</strong> Pedido entregado al cliente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}