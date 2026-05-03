import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuditLogs } from '@/features/audit'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import { useLocaleFormat } from '@/utils/format'

export default function AuditLogsPage() {
  const [action, setAction] = useState('')
  const { formatDateTime } = useLocaleFormat()
  const { data } = useAuditLogs({ action: action || undefined, page: 1, pageSize: 50 })
  const logs = data?.items ?? []
  const { t } = useTranslation('audit')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <div className="flex items-end gap-2">
        <Input label={t('log.action')} value={action} onChange={(e) => setAction(e.target.value)} placeholder={t('placeholder.actionFilter')} />
        <Button variant="secondary" onClick={() => setAction('')}>{t('actions.clearFilter')}</Button>
      </div>
      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{log.action}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  {log.entityType} · {log.entityId} · {log.userName || t('log.systemUser')}
                </p>
                {log.reason ? <p className="mt-1 text-sm">{t('log.reason')}: {log.reason}</p> : null}
              </div>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{formatDateTime(log.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
