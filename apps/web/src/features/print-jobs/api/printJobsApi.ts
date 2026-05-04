import apiClient from '@/services/api'

export type PrintJobEntityType = 'order' | 'bill' | 'order_item_cancel'
export type PrinterType = 'Kitchen' | 'Cashier' | 'KitchenCancel'
export type PrintJobStatus = 'Pending' | 'Printing' | 'Printed' | 'Failed'

export interface PrintJobStatusSummary {
  id: string
  entityType: PrintJobEntityType
  entityId: string
  printerType: PrinterType
  status: PrintJobStatus
  errorMessage?: string
  retryCount: number
  printedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LatestPrintJobParams {
  entityType: PrintJobEntityType
  entityId?: string
  printerType?: PrinterType
}

export const printJobsApi = {
  async latest(params: LatestPrintJobParams) {
    const response = await apiClient.get<PrintJobStatusSummary>('/api/print-jobs/latest', { params })
    return response.data
  },
}
