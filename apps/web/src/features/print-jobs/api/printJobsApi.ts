import axios from 'axios'
import type { PrintJob } from '@/types'

const AGENT_KEY_HEADER = 'X-Print-Agent-Key'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5141'

export const printJobsApi = {
  async pending(params: { printerType?: string; limit?: number; agentKey: string }) {
    const response = await axios.get<PrintJob[]>(`${API_URL}/api/print-jobs/pending`, {
      params: {
        printerType: params.printerType || undefined,
        limit: params.limit ?? 20,
      },
      headers: {
        [AGENT_KEY_HEADER]: params.agentKey,
      },
    })
    return response.data
  },
}
