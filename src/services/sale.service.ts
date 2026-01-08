import api from '../api/axios'
import type { Sale, SaleProduct } from '../types/Sale'

interface CreateSaleProductDTO {
  product_id: number
  quantity: number
  price_at_sale: number
}

const SaleService = {
  create: async (products: CreateSaleProductDTO[]) => {
    const { data } = await api.post('/sales', { products })
    return data
  },

  getAll: async (): Promise<Sale[]> => {
    const { data } = await api.get('/sales')
    return data
  },

  getById: async (id: number): Promise<Sale & { products: SaleProduct[] }> => {
    const { data } = await api.get(`/sales/${id}`)
    return data
  },

  update: async (id: number, products: CreateSaleProductDTO[]) => {
    const { data } = await api.put(`/sales/${id}`, { products })
    return data
  },

  cancel: async (id: number) => {
    const { data } = await api.delete(`/sales/${id}`)
    return data
  },

  deleteSaleProduct: async (id: number) => {
    const { data } = await api.delete(`/sales/products/${id}`)
    return data
  }
}

export default SaleService
