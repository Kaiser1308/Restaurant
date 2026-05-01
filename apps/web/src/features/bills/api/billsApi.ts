import apiClient from '@/services/api'
import type { Bill, BillPreview, BillSummary, PaymentType } from '@/types'

export const billsApi = {
  async previewOrder(orderId: string) {
    const response = await apiClient.get<BillPreview>(`/api/orders/${orderId}/bill-preview`)
    return response.data
  },
  async payOrder(orderId: string, paymentType: PaymentType) {
    const response = await apiClient.post<{ billId: string }>(`/api/orders/${orderId}/pay`, { paymentType })
    return response.data
  },
  async list(params?: { date?: string; status?: string }) {
    const response = await apiClient.get<BillSummary[]>('/api/bills', { params })
    return response.data
  },
  async get(id: string) {
    const response = await apiClient.get<Bill>(`/api/bills/${id}`)
    return response.data
  },
  async void(id: string, reason: string) {
    const response = await apiClient.post<Bill>(`/api/bills/${id}/void`, { reason })
    return response.data
  },
}
