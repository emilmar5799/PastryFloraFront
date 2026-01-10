import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderService, type CreateOrderData, type UpdateOrderData } from '../../services/order.service';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  UserIcon,
  PhoneIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CakeIcon,
  HashtagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  GiftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface OrderFormState {
  type: 'SMALL' | 'LARGE';
  delivery_datetime: string;
  customer_name: string;
  customer_ci?: string;
  phone?: string;
  color?: string;
  price?: number;
  pieces?: number;
  specifications?: string;
  advance: number;
  event?: string;
  warranty?: string;
}

const defaultFormState: OrderFormState = {
  type: 'SMALL',
  delivery_datetime: '',
  customer_name: '',
  customer_ci: '',
  phone: '',
  color: '',
  price: undefined,
  pieces: 1,
  specifications: '',
  advance: 0,
  event: '',
  warranty: ''
};

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<OrderFormState>(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    } else {
      // Set default delivery datetime to tomorrow at 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      setFormState(prev => ({
        ...prev,
        delivery_datetime: tomorrow.toISOString().slice(0, 16)
      }));
    }
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const order = await OrderService.getById(Number(id));
      setFormState({
        type: order.type,
        delivery_datetime: new Date(order.delivery_datetime).toISOString().slice(0, 16),
        customer_name: order.customer_name,
        customer_ci: order.customer_ci || '',
        phone: order.phone || '',
        color: order.color || '',
        price: order.price || undefined,
        pieces: order.pieces || 1,
        specifications: order.specifications || '',
        advance: order.advance,
        event: order.event || '',
        warranty: order.warranty || ''
      });
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones comunes
    if (!formState.delivery_datetime) {
      newErrors.delivery_datetime = 'La fecha de entrega es requerida';
    }
    
    if (!formState.customer_name.trim()) {
      newErrors.customer_name = 'El nombre del cliente es requerido';
    }

    if (formState.advance < 0) {
      newErrors.advance = 'El anticipo no puede ser negativo';
    }

    // Validaciones específicas para pedidos GRANDES
    if (formState.type === 'LARGE') {
      if (!formState.event?.trim()) {
        newErrors.event = 'El tipo de evento es requerido para pedidos grandes';
      }
      if (formState.price !== undefined && formState.price < 0) {
        newErrors.price = 'El precio no puede ser negativo';
      }
      if (formState.pieces !== undefined && formState.pieces < 1) {
        newErrors.pieces = 'La cantidad de piezas debe ser al menos 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (id) {
        // Preparar datos para ACTUALIZACIÓN
        const updateData: UpdateOrderData = {
          type: formState.type,
          delivery_datetime: formState.delivery_datetime,
          customer_name: formState.customer_name.trim(),
          color: formState.color?.trim() || undefined,
          price: formState.price || undefined,
          specifications: formState.specifications?.trim() || undefined,
          advance: formState.advance
        };

        // Agregar campos adicionales solo si es pedido GRANDE
        if (formState.type === 'LARGE') {
          updateData.customer_ci = formState.customer_ci?.trim() || undefined;
          updateData.phone = formState.phone?.trim() || undefined;
          updateData.pieces = formState.pieces || undefined;
          updateData.event = formState.event?.trim() || undefined;
          updateData.warranty = formState.warranty?.trim() || undefined;
        }

        await OrderService.update(Number(id), updateData);
        alert('✅ Pedido actualizado correctamente');
      } else {
        // Preparar datos para CREACIÓN
        const createData: CreateOrderData = {
          type: formState.type,
          delivery_datetime: formState.delivery_datetime,
          customer_name: formState.customer_name.trim(),
          advance: formState.advance
        };

        // Campos opcionales para pedidos pequeños
        if (formState.color?.trim()) createData.color = formState.color.trim();
        if (formState.price !== undefined) createData.price = formState.price;
        if (formState.specifications?.trim()) createData.specifications = formState.specifications.trim();

        // Campos adicionales solo para pedidos GRANDES
        if (formState.type === 'LARGE') {
          if (formState.customer_ci?.trim()) createData.customer_ci = formState.customer_ci.trim();
          if (formState.phone?.trim()) createData.phone = formState.phone.trim();
          if (formState.pieces) createData.pieces = formState.pieces;
          if (formState.event?.trim()) createData.event = formState.event.trim();
          if (formState.warranty?.trim()) createData.warranty = formState.warranty.trim();
        }

        await OrderService.create(createData);
        alert('✅ Pedido creado correctamente');
      }
      
      navigate('/orders');
    } catch (error: unknown) {
      console.error('Error saving order:', error);
      let errorMessage = 'Error al guardar';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }
      
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = <K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando se edita el campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return '0.00';
    const rounded = Math.round(price * 100) / 100;
    const integerPart = Math.floor(rounded);
    const decimalPart = Math.round((rounded - integerPart) * 100);
    
    if (decimalPart === 0) return `${integerPart}.00`;
    if (decimalPart < 10) return `${integerPart}.0${decimalPart}`;
    return `${integerPart}.${decimalPart}`;
  };

  const calculateRemaining = () => {
    if (!formState.price) return 0;
    return formState.price - formState.advance;
  };

  const eventTypes = [
    { value: 'MATRIMONIO', label: '💍 Matrimonio', icon: UsersIcon },
    { value: 'BAUTIZO', label: '👶 Bautizo', icon: GiftIcon },
    { value: 'QUINCE_AÑOS', label: '🎂 15 Años', icon: CakeIcon },
    { value: 'CUMPLEAÑOS', label: '🎉 Cumpleaños', icon: SparklesIcon },
    { value: 'ANIVERSARIO', label: '📅 Aniversario', icon: CalendarDaysIcon },
    { value: 'GRADUACION', label: '🎓 Graduación', icon: ClipboardDocumentListIcon },
    { value: 'OTRO', label: '✨ Otro evento', icon: SparklesIcon }
  ];

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pedido...</p>
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
              <CakeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {id ? '✏️ Editar Pedido' : '➕ Nuevo Pedido'}
              </h1>
              <p className="text-gray-600 mt-1">
                {id ? 'Modifica los detalles del pedido' : 'Crea un nuevo pedido para la pastelería'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Información Principal</h2>
              
              {/* Tipo de pedido */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Pedido *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'SMALL')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formState.type === 'SMALL'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TagIcon className={`w-5 h-5 ${formState.type === 'SMALL' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Pequeño</p>
                        <p className="text-sm text-gray-500">Tortas estándar</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleChange('type', 'LARGE')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formState.type === 'LARGE'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CakeIcon className={`w-5 h-5 ${formState.type === 'LARGE' ? 'text-purple-600' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Grande (Evento)</p>
                        <p className="text-sm text-gray-500">Eventos especiales</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campos básicos (para ambos tipos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información del cliente */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    Información del Cliente
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Cliente *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                          errors.customer_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: María González"
                        value={formState.customer_name}
                        onChange={(e) => handleChange('customer_name', e.target.value)}
                      />
                    </div>
                    {errors.customer_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                    )}
                  </div>

                  {formState.type === 'LARGE' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="Ej: 71234567"
                            value={formState.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          C.I. (Opcional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HashtagIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                            placeholder="Ej: 1234567"
                            value={formState.customer_ci}
                            onChange={(e) => handleChange('customer_ci', e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Información de entrega */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
                    Información de Entrega
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha y Hora de Entrega *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="datetime-local"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                          errors.delivery_datetime ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formState.delivery_datetime}
                        onChange={(e) => handleChange('delivery_datetime', e.target.value)}
                      />
                    </div>
                    {errors.delivery_datetime && (
                      <p className="text-red-500 text-sm mt-1">{errors.delivery_datetime}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color (Opcional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <TagIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Ej: Azul pastel, Rosa, Blanco"
                        value={formState.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos específicos para pedidos GRANDES */}
              {formState.type === 'LARGE' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <h3 className="font-semibold text-purple-800 mb-4">Información para Evento Especial</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tipo de Evento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Evento *
                      </label>
                      <select
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                          errors.event ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formState.event}
                        onChange={(e) => handleChange('event', e.target.value)}
                      >
                        <option value="">Seleccione un evento</option>
                        {eventTypes.map((eventType) => {
                          return (
                            <option key={eventType.value} value={eventType.value}>
                              {eventType.label}
                            </option>
                          );
                        })}
                      </select>
                      {errors.event && (
                        <p className="text-red-500 text-sm mt-1">{errors.event}</p>
                      )}
                    </div>

                    {/* Piezas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad de Piezas
                      </label>
                      <input
                        type="number"
                        min="1"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                          errors.pieces ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formState.pieces}
                        onChange={(e) => handleChange('pieces', Number(e.target.value))}
                      />
                      {errors.pieces && (
                        <p className="text-red-500 text-sm mt-1">{errors.pieces}</p>
                      )}
                    </div>

                    {/* Precio Total */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Total (Bs)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                            errors.price ? 'border-red-300' : 'border-gray-300'
                          }`}
                          value={formState.price || ''}
                          onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                      )}
                    </div>

                    {/* Garantía */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Garantía (Opcional)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="Ej: 7 días de garantía"
                        value={formState.warranty}
                        onChange={(e) => handleChange('warranty', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Precio (para ambos tipos) */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Total (Bs) {formState.type === 'LARGE' ? '' : '(Opcional)'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    value={formState.price || ''}
                    onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Especificaciones (para ambos tipos) */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                  Especificaciones (Opcional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition min-h-[120px]"
                  placeholder="Detalles adicionales, instrucciones especiales, alergias, decoración específica, etc."
                  value={formState.specifications}
                  onChange={(e) => handleChange('specifications', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Anticipo y resumen */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Anticipo y Confirmación</h2>
              
              {/* Anticipo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anticipo (Bs) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-right font-mono ${
                      errors.advance ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={formState.advance}
                    onChange={(e) => handleChange('advance', Number(e.target.value))}
                  />
                </div>
                {errors.advance && (
                  <p className="text-red-500 text-sm mt-1">{errors.advance}</p>
                )}
              </div>

              {/* Resumen financiero */}
              {formState.price !== undefined && formState.price > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-3">Resumen Financiero</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio total:</span>
                      <span className="font-semibold">Bs {formatPrice(formState.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Anticipo:</span>
                      <span className="font-semibold text-green-600">- Bs {formatPrice(formState.advance)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Saldo pendiente:</span>
                        <span className="text-blue-600">Bs {formatPrice(calculateRemaining())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">Vista Previa</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Tipo:</span>
                    <span className={`font-bold ${
                      formState.type === 'LARGE' ? 'text-purple-600' : 'text-blue-600'
                    }`}>
                      {formState.type === 'LARGE' ? 'Grande (Evento)' : 'Pequeño'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Cliente:</span>
                    <span className="font-medium truncate max-w-[120px]">{formState.customer_name || '[Sin nombre]'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Entrega:</span>
                    <span className="font-medium text-right">
                      {formState.delivery_datetime 
                        ? new Date(formState.delivery_datetime).toLocaleDateString('es-BO')
                        : '[Sin fecha]'
                      }
                    </span>
                  </div>
                  {formState.type === 'LARGE' && formState.event && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Evento:</span>
                      <span className="font-medium">{formState.event}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium py-3.5 px-4 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-6 h-6" />
                      {id ? 'Actualizar Pedido' : 'Crear Pedido'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  disabled={submitting}
                  className="w-full px-4 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircleIcon className="w-5 h-5 inline mr-2" />
                  Cancelar
                </button>
              </div>
            </div>

            {/* Información */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📋 Diferencias por Tipo</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Pequeño:</p>
                  <ul className="text-xs text-blue-600 list-disc list-inside ml-2">
                    <li>Fecha de entrega</li>
                    <li>Nombre del cliente</li>
                    <li>Color (opcional)</li>
                    <li>Precio (opcional)</li>
                    <li>Especificaciones (opcional)</li>
                    <li>Anticipo</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-700">Grande (Evento):</p>
                  <ul className="text-xs text-purple-600 list-disc list-inside ml-2">
                    <li>Todos los campos del pequeño</li>
                    <li>Teléfono</li>
                    <li>C.I.</li>
                    <li>Tipo de evento</li>
                    <li>Cantidad de piezas</li>
                    <li>Garantía</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}