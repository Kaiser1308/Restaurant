import apiClient from '@/services/api'
import type { OrderDetail, RestaurantTable, TableStatus } from '@/types'

export const tablesApi = {
  async list() {
    const response = await apiClient.get<RestaurantTable[]>('/api/tables')
    return response.data
  },
  async create(name: string) {
    const response = await apiClient.post<RestaurantTable>('/api/tables', { name })
    return response.data
  },
  async update(id: string, payload: { name: string; status: TableStatus }) {
    const response = await apiClient.patch<RestaurantTable>(`/api/tables/${id}`, payload)
    return response.data
  },
  async getActiveOrder(tableId: string) {
    const response = await apiClient.get<OrderDetail>(`/api/tables/${tableId}/active-order`)
    return response.data
  },
}
