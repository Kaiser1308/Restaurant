import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBill } from '@/features/bills'
import { billsApi } from '@/features/bills'
import { useLatestPrintJob } from '@/features/print-jobs'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'
import { useLocaleFormat } from '@/utils/format'

export default function BillDetailPage({ canVoid }: { canVoid: boolean }) {
  const queryClient = useQueryClient()
  const { billId = '' } = useParams()
  const { data: bill } = useBill(billId)
  const [voidOpen, setVoidOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const { formatMoney, formatDateTime } = useLocaleFormat()
  const { t } = useTranslation('bills')
  const { t: tCommon } = useTranslation('common')
  const { data: cashierPrintJob, isLoading: isPrintJobLoading, isError: isPrintJobError } = useLatestPrintJob({
    entityType: 'bill',
    entityId: bill?.id,
    printerType: 'Cashier',
  })

  const voidBill = useMutation({
    mutationFn: () => billsApi.void(billId, reason.trim()),
    onSuccess: async () => {
      setVoidOpen(false)
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['bill', billId] })
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
      await queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: () => setToastMessage(t('errors.voidFailed')),
  })

  if (!bill) {
    return <p>{t('loading.detail')}</p>
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">{t('title')} {bill.billNumber}</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">{bill.tableName} · {formatDateTime(bill.paidAt)}</p>
          </div>
          <StatusBadge status={bill.status} />
        </div>
        <div className="rounded border border-[var(--color-outline-variant)] bg-[var(--color-surface-low)] px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{t('printStatus.title')}</span>
            <span>
              {cashierPrintJob ? t(`printStatus.status.${cashierPrintJob.status}`) : isPrintJobLoading ? t('printStatus.loading') : t('printStatus.notFound')}
            </span>
          </div>
          {cashierPrintJob?.status === 'Failed' ? (
            <div className="mt-1 space-y-1 text-xs text-[var(--color-error)]">
              <p>{t('printStatus.retryCount', { count: cashierPrintJob.retryCount })}</p>
              {cashierPrintJob.errorMessage ? <p>{t('printStatus.errorMessage', { message: cashierPrintJob.errorMessage })}</p> : null}
            </div>
          ) : null}
          {isPrintJobError ? <p className="mt-1 text-xs text-[var(--color-error)]">{t('printStatus.notFound')}</p> : null}
        </div>
        {bill.items.map(item => (
          <div key={item.id} className="flex justify-between rounded border p-3">
            <p>
              {item.itemNameSnapshot}{' '}
              {tCommon('labels.quantityTimes', { qty: item.quantity })}
            </p>
            <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-lg font-bold">
          <span>{t('preview.totalAmount')}</span>
          <span>{formatMoney(bill.totalAmount)}</span>
        </div>
        {bill.voidReason ? <p className="text-sm text-[var(--color-error)]">{t('actions.voidReason')}: {bill.voidReason}</p> : null}
        {canVoid && bill.status === 'Paid' ? (
          <Button variant="danger" onClick={() => setVoidOpen(true)}>{t('actions.void')}</Button>
        ) : null}
      </div>

      <Modal open={voidOpen}>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('actions.voidWithNumber', { billNumber: bill.billNumber })}</p>
          <Input label={t('actions.voidReason')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('actions.voidPlaceholder')} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setVoidOpen(false)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" className="flex-1" disabled={!reason.trim() || voidBill.isPending} onClick={() => voidBill.mutate()}>
              {t('actions.confirmVoid')}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </Card>
  )
}
