// services/orderProduct.service.ts
import api from '../api/axios';
import type { Product } from '../types/Product';

export interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  name?: string; // nombre del producto (viene del join)
  price?: number; // precio del producto (viene del join)
}

export interface OrderProductWithDetails extends OrderProduct {
  name: string;
  price: number;
}

export interface AddProductsToOrderData {
  products: {
    product_id: number;
    quantity: number;
  }[];
}

export const OrderProductService = {
  // Obtener productos de una orden (REFILL, ADMIN, SUPERVISOR)
  getByOrderId(orderId: number): Promise<OrderProductWithDetails[]> {
    return api.get(`/orders/${orderId}/products`).then(r => r.data);
  },

  // Agregar productos a una orden (solo ADMIN y SUPERVISOR)
  addProducts(orderId: number, data: AddProductsToOrderData) {
    return api.post(`/orders/${orderId}/products`, data).then(r => r.data);
  },

  // Actualizar cantidad de un producto (solo ADMIN y SUPERVISOR)
  updateQuantity(id: number, quantity: number) {
    return api.put(`/orders/products/${id}`, { quantity }).then(r => r.data);
  },

  // Eliminar un producto de una orden (solo ADMIN y SUPERVISOR)
  deleteProduct(id: number) {
    return api.delete(`/orders/products/${id}`).then(r => r.data);
  }
};