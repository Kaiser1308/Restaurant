import { useQuery } from '@tanstack/react-query'
import { billsApi } from '../api/billsApi'

export function useBillPreview(orderId?: string) {
  return useQuery({
    queryKey: ['billPreview', orderId],
    queryFn: () => billsApi.previewOrder(orderId!),
    enabled: !!orderId,
  })
}

export function useBill(id?: string) {
  return useQuery({
    queryKey: ['bill', id],
    queryFn: () => billsApi.get(id!),
    enabled: !!id,
  })
}

export function useBills(date?: string, status?: string) {
  return useQuery({
    queryKey: ['bills', date, status],
    queryFn: () => billsApi.list({ date, status }),
  })
}
