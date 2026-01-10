export type OrderStatus =
  | 'DEFAULT'
  | 'FAILED'
  | 'DONE'
  | 'DELIVERED'
  | 'FINISHED';

export type OrderType = 'SMALL' | 'LARGE';

export interface Order {
  id: number;
  branch_id: number;
  created_by: number;

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

  status: OrderStatus;
  type: OrderType;

  created_at: string;
}
