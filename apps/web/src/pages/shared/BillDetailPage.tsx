import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useBill } from '@/features/bills'
import { billsApi } from '@/features/bills'
import Button from '@/components/Button'
import Card from '@/components/Card'
import ConfirmDialog from '@/components/ConfirmDialog'
import StatusBadge from '@/components/StatusBadge'
import Textarea from '@/components/Textarea'
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
  const { t } = useTranslation(['bills', 'common'])
  const { t: tCommon } = useTranslation('common')

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
    <div className="app-page">
      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--color-primary)]">{t('title')}</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight">{bill.billNumber}</h1>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{bill.tableName} / {formatDateTime(bill.paidAt)}</p>
            </div>
            <StatusBadge status={bill.status} />
          </div>

          {bill.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
              <p className="font-semibold">
                {item.itemNameSnapshot}{' '}
                {tCommon('labels.quantityTimes', { qty: item.quantity })}
              </p>
              <p className="font-bold">{formatMoney(item.lineTotal)}</p>
            </div>
          ))}

          <div className="flex justify-between border-t border-[var(--color-outline-variant)] pt-3 text-lg font-extrabold">
            <span>{t('preview.totalAmount')}</span>
            <span>{formatMoney(bill.totalAmount)}</span>
          </div>
          {bill.voidReason ? <p className="text-sm font-semibold text-[var(--color-error)]">{t('actions.voidReason')}: {bill.voidReason}</p> : null}
          {canVoid && bill.status === 'Paid' ? (
            <Button variant="danger" onClick={() => setVoidOpen(true)} disabled={voidBill.isPending}>{t('actions.void')}</Button>
          ) : null}
        </div>

        <ConfirmDialog
          open={voidOpen}
          title={t('actions.voidWithNumber', { billNumber: bill.billNumber })}
          confirmLabel={t('actions.confirmVoid')}
          cancelLabel={t('common:actions.cancel')}
          confirmVariant="danger"
          disabled={!reason.trim() || voidBill.isPending}
          onCancel={() => setVoidOpen(false)}
          onConfirm={() => voidBill.mutate()}
        >
          <Textarea label={t('actions.voidReason')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('actions.voidPlaceholder')} />
        </ConfirmDialog>
        {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
      </Card>
    </div>
  )
}
