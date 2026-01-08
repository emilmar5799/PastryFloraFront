import api from '../api/axios'
import type { Product } from '../types/Product'

interface CreateProductDTO {
  name: string
  price: number
}

interface UpdateProductDTO {
  name: string
  price: number
  active?: boolean
}

const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products')
    return data
  },

  getById: async (id: number): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`)
    return data
  },

  create: async (payload: CreateProductDTO) => {
    const { data } = await api.post('/products', payload)
    return data
  },

  update: async (id: number, payload: UpdateProductDTO) => {
    const { data } = await api.put(`/products/${id}`, payload)
    return data
  },

  remove: async (id: number) => {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
}

export default ProductService
