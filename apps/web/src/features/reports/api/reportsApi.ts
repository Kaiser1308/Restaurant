import apiClient from '@/services/api'
import type { DailyRevenue } from '@/types'

export const reportsApi = {
  async dailyRevenue(date: string) {
    const response = await apiClient.get<DailyRevenue>('/api/reports/daily-revenue', {
      params: { date },
    })
    return response.data
  },
}
