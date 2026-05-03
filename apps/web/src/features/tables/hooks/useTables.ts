import { useQuery } from '@tanstack/react-query'
import { tablesApi } from '../api/tablesApi'

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.list,
    refetchInterval: 3000,
  })
}
