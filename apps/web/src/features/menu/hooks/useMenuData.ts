import { useQuery } from '@tanstack/react-query'
import { menuApi } from '../api/menuApi'

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
