import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrderDetail } from '@/features/orders'
import { useBillPreview } from '@/features/bills'
import { billsApi } from '@/features/bills'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
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
  const { t } = useTranslation('bills')
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{preview.tableName}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{t('preview.orderNumber', { id: order.id.slice(0, 8) })}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          {preview.items.map(item => (
            <div key={item.id} className="flex justify-between rounded border p-3">
              <div>
                <p className="font-semibold">{item.itemNameSnapshot}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  {tCommon('labels.quantityTimes', { qty: item.quantity })}
                </p>
              </div>
              <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('preview.title')}</p>
          <p className="text-3xl font-extrabold">{formatMoney(preview.totalAmount)}</p>
          <div className="space-y-2">
            {(['Cash', 'Qr', 'BankTransfer'] as PaymentType[]).map(type => (
              <Button
                key={type}
                className="w-full"
                variant={paymentType === type ? 'primary' : 'secondary'}
                onClick={() => setPaymentType(type)}
              >
                {t(paymentTypeKey[type])}
              </Button>
            ))}
          </div>
          <Button className="w-full" disabled={payOrder.isPending} onClick={() => setConfirmOpen(true)}>
            {t('actions.confirmPayment')}
          </Button>
        </div>
      </Card>

      <Modal open={confirmOpen}>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('actions.confirmPayment')}</p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            {t('actions.confirmPaymentDescription', { tableName: preview.tableName })}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>{t('common:actions.cancel')}</Button>
            <Button className="flex-1" disabled={payOrder.isPending} onClick={() => payOrder.mutate()}>
              {t('actions.pay', { type: t(paymentTypeKey[paymentType]) })}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
