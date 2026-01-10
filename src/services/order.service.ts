import api from '../api/axios';
import type { Order } from '../types/order';

export interface CreateOrderData {
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

export interface UpdateOrderData {
  type?: 'SMALL' | 'LARGE';
  delivery_datetime?: string;
  customer_name?: string;
  customer_ci?: string;
  phone?: string;
  color?: string;
  price?: number;
  pieces?: number;
  specifications?: string;
  advance?: number;
  event?: string;
  warranty?: string;
  status?: Order['status'];
}

export const OrderService = {
  getAll(): Promise<Order[]> {
    return api.get('/orders').then(r => r.data);
  },

  getById(id: number): Promise<Order> {
    return api.get(`/orders/${id}`).then(r => r.data);
  },

  create(data: CreateOrderData) {
    return api.post('/orders', data).then(r => r.data);
  },

  update(id: number, data: UpdateOrderData) {
    return api.put(`/orders/${id}`, data).then(r => r.data);
  },

  remove(id: number) {
    return api.delete(`/orders/${id}`).then(r => r.data);
  },

  markAsFailed(id: number) {
    return api.patch(`/orders/${id}/failed`).then(r => r.data);
  },

  markAsDone(id: number) {
    return api.patch(`/orders/${id}/done`).then(r => r.data);
  },

  markAsDelivered(id: number) {
    return api.patch(`/orders/${id}/delivered`).then(r => r.data);
  },

  markAsFinished(id: number) {
    return api.patch(`/orders/${id}/finished`).then(r => r.data);
  }
};