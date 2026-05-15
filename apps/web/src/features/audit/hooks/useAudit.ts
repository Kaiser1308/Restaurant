import { useQuery } from '@tanstack/react-query'
import { auditApi } from '../api/auditApi'

export function useAuditLogs(params?: {
  from?: string
  to?: string
  action?: string
  entityType?: string
  userId?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['auditLogs', params],
    queryFn: () => auditApi.list(params),
  })
}
