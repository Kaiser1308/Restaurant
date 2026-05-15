import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'
import { tablesApi } from '@/features/tables'

export function useOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => ordersApi.getDetail(orderId!),
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tableId: string) => ordersApi.create(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export function useKitchenOrders() {
  return useQuery({
    queryKey: ['kitchenOrders'],
    queryFn: async () => {
      const tables = await tablesApi.list()
      const occupied = tables.filter(t => t.status === 'Occupied' || t.status === 'NeedsPayment')
      const orders = await Promise.all(occupied.map(async (table) => {
        try {
          return await tablesApi.getActiveOrder(table.id)
        } catch {
          return null
        }
      }))
      return orders.filter(Boolean)
    },
    refetchInterval: 2000,
  })
}
