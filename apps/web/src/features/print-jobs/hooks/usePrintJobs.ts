import { useQuery } from '@tanstack/react-query'
import { printJobsApi } from '../api/printJobsApi'

export function usePendingPrintJobs(params: { printerType?: string; limit?: number; agentKey: string }) {
  return useQuery({
    queryKey: ['printJobs', params.printerType, params.limit, Boolean(params.agentKey)],
    queryFn: () => printJobsApi.pending(params),
    enabled: Boolean(params.agentKey.trim()),
    refetchInterval: 3000,
  })
}
