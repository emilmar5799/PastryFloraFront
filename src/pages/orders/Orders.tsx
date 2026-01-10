import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../types/order';
import { OrderService } from '../../services/order.service';
import { 
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  UserIcon,
  CurrencyDollarIcon,
  TagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UsersIcon,
  GiftIcon,
  CakeIcon,
  CalendarDaysIcon as CalendarIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'small' | 'large'>('all');
  const navigate = useNavigate();

  // Event types for combobox
  const eventTypes = [
    { value: 'MATRIMONIO', label: '💍 Matrimonio', icon: UsersIcon },
    { value: 'BAUTIZO', label: '👶 Bautizo', icon: GiftIcon },
    { value: 'QUINCE_AÑOS', label: '🎂 15 Años', icon: CakeIcon },
    { value: 'CUMPLEAÑOS', label: '🎉 Cumpleaños', icon: SparklesIcon },
    { value: 'ANIVERSARIO', label: '📅 Aniversario', icon: CalendarIcon },
    { value: 'GRADUACION', label: '🎓 Graduación', icon: ClipboardDocumentCheckIcon },
    { value: 'OTRO', label: '✨ Otro evento', icon: SparklesIcon }
  ];

  // Nuevos estados para filtros
  const [searchName, setSearchName] = useState('');
  const [searchCI, setSearchCI] = useState('');
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'none' | 'range' | 'single'>('none');
  const [showFilters, setShowFilters] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'DONE':
        return { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100', text: 'Listo' };
      case 'DELIVERED':
        return { icon: TruckIcon, color: 'text-blue-500', bg: 'bg-blue-100', text: 'Entregado' };
      case 'FINISHED':
        return { icon: SparklesIcon, color: 'text-purple-500', bg: 'bg-purple-100', text: 'Finalizado' };
      case 'FAILED':
        return { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100', text: 'Fallido' };
      default:
        return { icon: ClockIcon, color: 'text-amber-500', bg: 'bg-amber-100', text: 'Pendiente' };
    }
  };

  const getTypeInfo = (type: Order['type']) => {
    return type === 'LARGE' 
      ? { text: 'Grande', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' }
      : { text: 'Pequeño', color: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800' };
  };

  // Función para normalizar fechas (solo fecha, sin hora)
  const normalizeDate = (dateString: string | Date): Date => {
    const date = new Date(dateString);
    // Crear nueva fecha solo con año, mes y día
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Función para parsear fecha del input
  const parseInputDate = (dateString: string): Date => {
    if (!dateString) return new Date(NaN);
    // dateString viene en formato "YYYY-MM-DD"
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Función para comparar fechas ignorando la hora
  const areDatesEqual = (date1: Date, date2: Date): boolean => {
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
    return normalizeDate(date1).getTime() === normalizeDate(date2).getTime();
  };

  // Función para resetear todos los filtros
  const resetFilters = () => {
    setSearchName('');
    setSearchCI('');
    setEventType('');
    setStartDate('');
    setEndDate('');
    setSingleDate('');
    setDateFilterType('none');
    setFilter('all');
  };

  // Función principal de filtrado
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtro por tipo (pequeño/grande)
      if (filter === 'small' && order.type !== 'SMALL') return false;
      if (filter === 'large' && order.type !== 'LARGE') return false;

      // Filtro por nombre
      if (searchName && !order.customer_name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Filtro por CI
      if (searchCI && order.customer_ci) {
        const orderCI = order.customer_ci.toLowerCase();
        const searchCILower = searchCI.toLowerCase();
        if (!orderCI.includes(searchCILower)) return false;
      }

      // Filtro por tipo de evento (solo para órdenes grandes)
      if (eventType && order.type === 'LARGE' && order.event) {
        if (order.event !== eventType) return false;
      }

      // Filtro por fecha
      if (dateFilterType !== 'none') {
        const orderDate = normalizeDate(order.delivery_datetime);
        
        if (dateFilterType === 'single' && singleDate) {
          const selectedDate = parseInputDate(singleDate);
          if (isNaN(selectedDate.getTime())) return true; // Si la fecha no es válida, no filtrar
          return areDatesEqual(orderDate, selectedDate);
        }

        if (dateFilterType === 'range') {
          const start = startDate ? parseInputDate(startDate) : null;
          const end = endDate ? parseInputDate(endDate) : null;
          
          // Si no hay fechas válidas, no filtrar
          if (!start && !end) return true;
          
          let include = true;
          
          if (start && !isNaN(start.getTime())) {
            include = include && (orderDate.getTime() >= normalizeDate(start).getTime());
          }
          
          if (end && !isNaN(end.getTime())) {
            include = include && (orderDate.getTime() <= normalizeDate(end).getTime());
          }
          
          return include;
        }
      }

      return true;
    });
  }, [orders, filter, searchName, searchCI, eventType, dateFilterType, singleDate, startDate, endDate]);

  // Función de ordenamiento complejo
  const sortedOrders = useMemo(() => {
    const now = new Date();
    const today = normalizeDate(now);
    
    return [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.delivery_datetime);
      const dateB = new Date(b.delivery_datetime);
      
      // Primero: Orden por estado (FAILED al final)
      if (a.status === 'FAILED' && b.status !== 'FAILED') return 1;
      if (b.status === 'FAILED' && a.status !== 'FAILED') return -1;
      
      // Segundo: Orden por fecha
      const dateOnlyA = normalizeDate(a.delivery_datetime);
      const dateOnlyB = normalizeDate(b.delivery_datetime);
      
      const diffA = dateOnlyA.getTime() - today.getTime();
      const diffB = dateOnlyB.getTime() - today.getTime();
      
      // Si ambos son hoy o futuros, orden normal (más cercano primero)
      if (diffA >= 0 && diffB >= 0) {
        // Ambos son hoy o futuros
        if (diffA === diffB) {
          // Mismo día, ordenar por hora (más temprano primero)
          const timeA = dateA.getHours() * 60 + dateA.getMinutes();
          const timeB = dateB.getHours() * 60 + dateB.getMinutes();
          if (timeA !== timeB) return timeA - timeB;
          
          // Misma hora, ordenar por tipo (pequeños primero)
          if (a.type === 'SMALL' && b.type === 'LARGE') return -1;
          if (a.type === 'LARGE' && b.type === 'SMALL') return 1;
          
          return dateA.getTime() - dateB.getTime();
        }
        return diffA - diffB;
      }
      
      // Si A es pasado y B es hoy/futuro, A va después
      if (diffA < 0 && diffB >= 0) return 1;
      // Si B es pasado y A es hoy/futuro, B va después
      if (diffB < 0 && diffA >= 0) return -1;
      
      // Ambos son pasados, más reciente primero
      return Math.abs(diffB) - Math.abs(diffA);
    });
  }, [filteredOrders]);

  const smallOrders = orders.filter(o => o.type === 'SMALL');
  const largeOrders = orders.filter(o => o.type === 'LARGE');

  // Contador de filtros activos
  const activeFilterCount = [
    filter !== 'all',
    searchName !== '',
    searchCI !== '',
    eventType !== '',
    dateFilterType !== 'none'
  ].filter(Boolean).length;

  // Handler para fecha específica
  const handleSingleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSingleDate(value);
    if (value && dateFilterType !== 'single') {
      setDateFilterType('single');
    }
  };

  // Handler para fecha inicial del rango
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    if (value && dateFilterType !== 'range') {
      setDateFilterType('range');
    }
  };

  // Handler para fecha final del rango
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    if (value && dateFilterType !== 'range') {
      setDateFilterType('range');
    }
  };

  // Función para formatear fecha en display
  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para calcular tiempo relativo
  const getTimeRelative = (dateString: string): string => {
    const now = new Date();
    const dateOnly = normalizeDate(dateString);
    const today = normalizeDate(now);
    
    const diffMs = dateOnly.getTime() - today.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 1) return `En ${diffDays} días`;
    if (diffDays < -1) return `Hace ${Math.abs(diffDays)} días`;
    
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/5 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
              <p className="text-gray-600 mt-1">Administra pedidos de tortas - Pequeños y Grandes (Eventos)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="p-3 text-gray-600 hover:text-purple-600 hover:bg-white rounded-xl transition-all"
              title="Refrescar lista"
            >
              <ArrowPathIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 relative ${
                showFilters 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white'
              }`}
              title="Mostrar/ocultar filtros"
            >
              <FunnelIcon className="w-6 h-6" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/orders/new')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-2.5 px-5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Nuevo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros Avanzados */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5" />
              Filtros Avanzados
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Limpiar filtros
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Búsqueda por Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2" />
                Buscar por nombre
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {searchName && (
                  <button
                    onClick={() => setSearchName('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Búsqueda por CI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClipboardDocumentListIcon className="w-4 h-4 inline mr-2" />
                Buscar por CI
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCI}
                  onChange={(e) => setSearchCI(e.target.value)}
                  placeholder="Ej: 1234567"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {searchCI && (
                  <button
                    onClick={() => setSearchCI('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tipo de Evento (ComboBox) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SparklesIcon className="w-4 h-4 inline mr-2" />
                Tipo de Evento
              </label>
              <div className="relative">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Todos los eventos</option>
                  {eventTypes.map((event) => {
                    return (
                      <option key={event.value} value={event.value}>
                        {event.label}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {eventType && (
                <button
                  onClick={() => setEventType('')}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Limpiar selección
                </button>
              )}
            </div>

            {/* Selector de tipo de fecha */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
                Filtrar por fecha de entrega
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tipo de filtro</label>
                  <select
                    value={dateFilterType}
                    onChange={(e) => {
                      setDateFilterType(e.target.value as 'none' | 'range' | 'single');
                      if (e.target.value === 'none') {
                        setSingleDate('');
                        setStartDate('');
                        setEndDate('');
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="none">Sin filtro de fecha</option>
                    <option value="single">Fecha específica</option>
                    <option value="range">Rango de fechas</option>
                  </select>
                </div>

                {dateFilterType === 'single' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fecha específica</label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={handleSingleDateChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}

                {dateFilterType === 'range' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha inicial</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha final</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Resumen de filtros activos */}
            <div className="md:col-span-2 lg:col-span-1 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Resumen de filtros</h4>
              <div className="space-y-1 text-sm">
                {filter !== 'all' && (
                  <p className="text-purple-600">• Tipo: {filter === 'small' ? 'Pequeños' : 'Grandes'}</p>
                )}
                {searchName && <p className="text-blue-600">• Nombre: "{searchName}"</p>}
                {searchCI && <p className="text-blue-600">• CI: "{searchCI}"</p>}
                {eventType && (
                  <p className="text-blue-600">
                    • Evento: {eventTypes.find(e => e.value === eventType)?.label || eventType}
                  </p>
                )}
                {dateFilterType === 'single' && singleDate && (
                  <p className="text-green-600">
                    • Fecha: {new Date(singleDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {dateFilterType === 'range' && startDate && endDate && (
                  <p className="text-green-600">
                    • Rango: {new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })} - {new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                )}
                {activeFilterCount === 0 && <p className="text-gray-500">Sin filtros aplicados</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Resumen de Pedidos</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total pedidos</p>
                  <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Pedidos pequeños</p>
                  <p className="text-2xl font-bold text-gray-800">{smallOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Pedidos grandes</p>
                  <p className="text-2xl font-bold text-gray-800">{largeOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros Rápidos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-gray-700 mb-4">Filtrar por tipo</h3>
            <div className="space-y-2">
              {[
                { id: 'all' as const, label: 'Todos los pedidos', count: orders.length },
                { id: 'small' as const, label: 'Solo pequeños', count: smallOrders.length },
                { id: 'large' as const, label: 'Solo grandes (Eventos)', count: largeOrders.length }
              ].map((filterOption) => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`w-full flex justify-between items-center p-3 rounded-lg transition-all ${
                    filter === filterOption.id
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{filterOption.label}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    filterOption.id === 'large' 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {filterOption.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Botón para mostrar más filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full mt-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                showFilters
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              {showFilters ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
            </button>
          </div>

          {/* Información */}
          <div className="bg-blue-50 rounded-xl p-5">
            <h4 className="font-medium text-blue-800 mb-2">📋 Tipos de Pedidos</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• <strong>Pequeño:</strong> Tortas estándar - Solo campos básicos</li>
              <li>• <strong>Grande:</strong> Eventos especiales - Todos los campos</li>
              <li>• La sucursal se obtiene automáticamente del usuario</li>
            </ul>
          </div>
        </div>

        {/* Tabla */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Lista de Pedidos</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Mostrando {sortedOrders.length} de {orders.length} pedido{sortedOrders.length !== 1 ? 's' : ''}
                    {activeFilterCount > 0 && ' (filtrados)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Limpiar
                    </button>
                  )}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    filter === 'all' ? 'bg-gray-100 text-gray-800' :
                    filter === 'small' ? 'bg-blue-100 text-blue-800' :
                    'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'
                  }`}>
                    {filter === 'all' ? 'Todos' : filter === 'small' ? 'Pequeños' : 'Grandes'}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {sortedOrders.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg font-medium">
                    No hay pedidos que coincidan con los filtros
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-purple-600 hover:text-purple-700 font-medium mt-2"
                    >
                      Limpiar filtros para ver todos los pedidos →
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CI
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entrega
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Anticipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedOrders.map(order => {
                      
                      const statusInfo = getStatusInfo(order.status);
                      const typeInfo = getTypeInfo(order.type);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <tr 
                          key={order.id} 
                          className={`hover:bg-gray-50 transition-colors cursor-pointer group ${
                            order.status === 'FAILED' ? 'bg-red-50/50' : ''
                          }`}
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mr-3">
                                <UserIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                {order.phone && (
                                  <p className="text-xs text-gray-500 mt-1">{order.phone}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {order.customer_ci || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {formatDisplayDate(order.delivery_datetime)}
                                </p>
                                <p className={`text-xs ${
                                  getTimeRelative(order.delivery_datetime) === 'Hoy' ? 'text-green-600 font-semibold' :
                                  getTimeRelative(order.delivery_datetime) === 'Mañana' ? 'text-blue-600' :
                                  getTimeRelative(order.delivery_datetime).startsWith('En') ? 'text-gray-500' :
                                  'text-amber-600'
                                }`}>
                                  {getTimeRelative(order.delivery_datetime)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                              {typeInfo.text}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {order.event ? (
                                eventTypes.find(e => e.value === order.event)?.label || order.event
                              ) : (
                                order.type === 'LARGE' ? 'Sin especificar' : 'N/A'
                              )}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                                <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                              </div>
                              <span className={`text-sm font-medium ${
                                order.status === 'FAILED' ? 'text-red-600' : 'text-gray-700'
                              }`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-bold text-green-600">
                                Bs {order.advance || 0}
                              </span>
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
        </div>
      </div>
    </div>
  );
}