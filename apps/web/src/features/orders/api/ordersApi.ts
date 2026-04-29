import apiClient from '@/services/api'
import type { OrderDetail } from '@/types'

export const ordersApi = {
  async create(tableId: string) {
    const response = await apiClient.post<{ id: string }>('/api/orders', { tableId })
    return response.data
  },
  async getDetail(orderId: string) {
    const response = await apiClient.get<OrderDetail>(`/api/orders/${orderId}`)
    return response.data
  },
  async addItem(orderId: string, menuItemId: string, quantity: number) {
    const response = await apiClient.post<OrderDetail>(`/api/orders/${orderId}/items`, { menuItemId, quantity })
    return response.data
  },
  async updateItem(itemId: string, quantity: number) {
    const response = await apiClient.patch<OrderDetail>(`/api/order-items/${itemId}`, { quantity })
    return response.data
  },
  async cancelItem(itemId: string, reason: string) {
    const response = await apiClient.post<OrderDetail>(`/api/order-items/${itemId}/cancel`, { reason })
    return response.data
  },
  async sendToKitchen(orderId: string) {
    const response = await apiClient.post<{ id: string; status: string }>(`/api/orders/${orderId}/send-to-kitchen`)
    return response.data
  },
}
