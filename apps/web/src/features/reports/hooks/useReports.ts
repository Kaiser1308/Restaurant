import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reportsApi'

export function useDailyRevenue(date: string) {
  return useQuery({
    queryKey: ['dailyRevenue', date],
    queryFn: () => reportsApi.dailyRevenue(date),
  })
}
