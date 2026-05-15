import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/Button'
import DataTable, { type DataTableColumn } from '@/components/DataTable'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import Select from '@/components/Select'
import StatusBadge from '@/components/StatusBadge'
import { usePendingPrintJobs } from '@/features/print-jobs'
import { useLocaleFormat } from '@/utils/format'
import type { PrintJob } from '@/types'

const AGENT_KEY_STORAGE = 'printAgentKey'

export default function PrintJobsPage() {
  const { t } = useTranslation(['common'])
  const { formatDateTime } = useLocaleFormat()
  const [agentKey, setAgentKey] = useState(() => localStorage.getItem(AGENT_KEY_STORAGE) ?? '')
  const [printerType, setPrinterType] = useState('')
  const { data: jobs = [], isLoading, refetch } = usePendingPrintJobs({ agentKey, printerType, limit: 20 })

  useEffect(() => {
    if (agentKey.trim()) {
      localStorage.setItem(AGENT_KEY_STORAGE, agentKey.trim())
    }
  }, [agentKey])

  const columns: Array<DataTableColumn<PrintJob>> = [
    { key: 'printer', header: t('printJobs.columns.printer'), render: (job) => <span className="font-bold">{job.printerType}</span> },
    { key: 'status', header: t('printJobs.columns.status'), render: (job) => <StatusBadge status={job.status} /> },
    { key: 'entity', header: t('printJobs.columns.entity'), render: (job) => `${job.entityType} / ${job.entityId.slice(0, 8)}` },
    { key: 'retry', header: t('printJobs.columns.retry'), render: (job) => job.retryCount },
    { key: 'created', header: t('printJobs.columns.createdAt'), render: (job) => formatDateTime(job.createdAt) },
    { key: 'error', header: t('printJobs.columns.error'), render: (job) => job.errorMessage || '-' },
  ]

  return (
    <div className="app-page space-y-4">
      <PageHeader
        title={t('printJobs.title')}
        subtitle={t('printJobs.subtitle')}
        actions={<Button variant="secondary" onClick={() => refetch()}>{t('actions.refresh')}</Button>}
      />

      <div className="soft-panel grid grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_220px]">
        <Input
          label={t('printJobs.agentKey')}
          type="password"
          value={agentKey}
          onChange={(e) => setAgentKey(e.target.value)}
          placeholder={t('printJobs.agentKeyPlaceholder')}
        />
        <Select
          label={t('printJobs.printerType')}
          value={printerType}
          onChange={(e) => setPrinterType(e.target.value)}
          options={[
            { value: '', label: t('printJobs.allPrinters') },
            { value: 'Kitchen', label: t('printJobs.kitchen') },
            { value: 'Cashier', label: t('printJobs.cashier') },
            { value: 'KitchenCancel', label: t('printJobs.kitchenCancel') },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        rows={jobs}
        getRowKey={(job) => job.id}
        isLoading={isLoading}
        emptyTitle={agentKey.trim() ? t('printJobs.emptyTitle') : t('printJobs.missingKeyTitle')}
        emptyDescription={agentKey.trim() ? t('printJobs.emptyDescription') : t('printJobs.missingKeyDescription')}
      />
    </div>
  )
}
