export interface Sale {
  id: number
  branch_id: number
  sold_by: number
  total: number
  status: 'ACTIVE' | 'CANCELLED'
  created_at: string
}

export interface SaleProduct {
  id: number
  sale_id: number
  product_id: number
  name: string
  quantity: number
  price_at_sale: number
}
