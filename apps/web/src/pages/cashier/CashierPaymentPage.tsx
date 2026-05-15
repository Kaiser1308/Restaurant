import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrderDetail } from '@/features/orders'
import { useBillPreview } from '@/features/bills'
import { billsApi } from '@/features/bills'
import Button from '@/components/Button'
import Card from '@/components/Card'
import ConfirmDialog from '@/components/ConfirmDialog'
import SegmentedControl from '@/components/SegmentedControl'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import Toast from '@/components/Toast'
import { useLocaleFormat } from '@/utils/format'
import type { PaymentType } from '@/types'

export default function CashierPaymentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orderId = '' } = useParams()
  const { data: order } = useOrderDetail(orderId)
  const { data: preview } = useBillPreview(orderId)
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { formatMoney } = useLocaleFormat()
  const { t } = useTranslation(['bills', 'common'])
  const { t: tCommon } = useTranslation('common')

  const paymentTypeKey: Record<PaymentType, string> = {
    Cash: 'payment.cash',
    Qr: 'payment.qr',
    BankTransfer: 'payment.bankTransfer',
  }

  const payOrder = useMutation({
    mutationFn: () => billsApi.payOrder(orderId, paymentType),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['tables'] })
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
      navigate(`/cashier/bills/${result.billId}`)
    },
    onError: () => setToastMessage(t('errors.paymentFailed')),
  })

  if (!order || !preview) {
    return <p>{t('loading.preview')}</p>
  }

  return (
    <div className="app-page grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--color-primary)]">{t('preview.title')}</p>
              <p className="mt-1 text-3xl font-extrabold leading-tight">{preview.tableName}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{t('preview.orderNumber', { id: order.id.slice(0, 8) })}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {preview.items.length === 0 ? (
            <EmptyState title={t('empty.items')} />
          ) : (
            preview.items.map(item => (
              <div key={item.id} className="flex justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
                <div>
                  <p className="font-bold">{item.itemNameSnapshot}</p>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    {tCommon('labels.quantityTimes', { qty: item.quantity })}
                  </p>
                </div>
                <p className="font-bold">{formatMoney(item.lineTotal)}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{t('preview.totalAmount')}</p>
            <p className="mt-1 text-4xl font-extrabold leading-tight">{formatMoney(preview.totalAmount)}</p>
          </div>
          <SegmentedControl
            value={paymentType}
            options={(['Cash', 'Qr', 'BankTransfer'] as PaymentType[]).map((type) => ({
              value: type,
              label: t(paymentTypeKey[type]),
            }))}
            onChange={setPaymentType}
          />
          <Button className="w-full" disabled={payOrder.isPending} onClick={() => setConfirmOpen(true)}>
            {t('actions.confirmPayment')}
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={t('actions.confirmPayment')}
        description={t('actions.confirmPaymentDescription', { tableName: preview.tableName })}
        confirmLabel={t('actions.pay', { type: t(paymentTypeKey[paymentType]) })}
        cancelLabel={t('common:actions.cancel')}
        disabled={payOrder.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => payOrder.mutate()}
      />
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
