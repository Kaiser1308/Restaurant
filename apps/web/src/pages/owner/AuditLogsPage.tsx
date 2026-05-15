import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/Button'
import DataTable, { type DataTableColumn } from '@/components/DataTable'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useAuditLogs } from '@/features/audit'
import { useLocaleFormat } from '@/utils/format'
import type { AuditLog } from '@/types'

export default function AuditLogsPage() {
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const { formatDateTime } = useLocaleFormat()
  const { data, isLoading } = useAuditLogs({
    action: action.trim() || undefined,
    entityType: entityType.trim() || undefined,
    page: 1,
    pageSize: 50,
  })
  const logs = data?.items ?? []
  const { t } = useTranslation(['audit', 'common'])

  const columns: Array<DataTableColumn<AuditLog>> = [
    { key: 'action', header: t('audit:log.action'), render: (log) => <span className="font-bold">{log.action}</span> },
    {
      key: 'entity',
      header: t('audit:log.entity'),
      render: (log) => (
        <div>
          <p className="font-semibold">{log.entityType}</p>
          <p className="max-w-[220px] truncate text-xs text-[var(--color-on-surface-variant)]">{log.entityId}</p>
        </div>
      ),
    },
    { key: 'user', header: t('audit:log.user'), render: (log) => log.userName || t('audit:log.systemUser') },
    { key: 'reason', header: t('audit:log.reason'), render: (log) => log.reason || '-' },
    { key: 'time', header: t('audit:log.createdAt'), render: (log) => formatDateTime(log.createdAt) },
  ]

  return (
    <div className="app-page space-y-4">
      <PageHeader
        title={t('audit:title')}
        subtitle={t('audit:subtitle')}
        meta={<span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">{data?.totalCount ?? 0}</span>}
      />

      <div className="soft-panel grid grid-cols-1 gap-3 p-3 md:grid-cols-[1fr_1fr_auto]">
        <Input label={t('audit:log.action')} value={action} onChange={(e) => setAction(e.target.value)} placeholder={t('audit:placeholder.actionFilter')} />
        <Input label={t('audit:log.entity')} value={entityType} onChange={(e) => setEntityType(e.target.value)} placeholder={t('audit:placeholder.entityFilter')} />
        <div className="flex items-end">
          <Button variant="secondary" onClick={() => { setAction(''); setEntityType('') }}>
            {t('audit:actions.clearFilter')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={logs}
        getRowKey={(log) => log.id}
        isLoading={isLoading}
        emptyTitle={t('audit:emptyTitle')}
        emptyDescription={t('audit:emptyDescription')}
      />
    </div>
  )
}
