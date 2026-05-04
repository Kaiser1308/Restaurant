import { useQuery } from '@tanstack/react-query'
import { printJobsApi, type LatestPrintJobParams } from '../api/printJobsApi'

export function useLatestPrintJob(params: LatestPrintJobParams) {
  return useQuery({
    queryKey: ['printJobLatest', params.entityType, params.entityId, params.printerType],
    queryFn: () => printJobsApi.latest(params),
    enabled: !!params.entityId,
    refetchInterval: 2000,
    retry: false,
  })
}
