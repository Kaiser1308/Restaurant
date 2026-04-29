import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/features/menu/api/menuApi'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { tablesApi } from '@/features/tables/api/tablesApi'

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
    refetchInterval: 3000,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMenuItems(categoryId?: string, search?: string) {
  return useQuery({
    queryKey: ['menuItems', categoryId, search],
    queryFn: () => menuApi.getMenuItems({ categoryId, search }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useOrderDetail(orderId?: string) {
  return useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: () => ordersApi.getDetail(orderId!),
    enabled: !!orderId,
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

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tableId: string) => ordersApi.create(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}
