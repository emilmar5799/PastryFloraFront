// utils/orderUtils.ts
import type { Order } from '../types/order';

// Filtrar solo pedidos grandes
export const filterLargeOrders = (orders: Order[]): Order[] => {
  return orders.filter(order => order.type === 'LARGE');
};

// Ordenar por fecha de entrega (más cercano primero)
export const sortOrdersByDeliveryDate = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    return new Date(a.delivery_datetime).getTime() - new Date(b.delivery_datetime).getTime();
  });
};

// Obtener el estado del pedido en texto
export const getOrderStatusText = (status: Order['status']): string => {
  switch (status) {
    case 'DEFAULT': return 'Pendiente';
    case 'DONE': return 'Listo';
    case 'DELIVERED': return 'Entregado';
    case 'FINISHED': return 'Finalizado';
    case 'FAILED': return 'Fallido';
    default: return 'Desconocido';
  }
};