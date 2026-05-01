import apiClient from '@/services/api'
import type { AuditLog, PagedResponse } from '@/types'

export const auditApi = {
  async list(params?: {
    from?: string
    to?: string
    action?: string
    entityType?: string
    userId?: string
    page?: number
    pageSize?: number
  }) {
    const response = await apiClient.get<PagedResponse<AuditLog>>('/api/audit-logs', { params })
    return response.data
  },
}
