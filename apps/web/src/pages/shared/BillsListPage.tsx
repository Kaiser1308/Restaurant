import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useBills } from '@/features/bills'
import Button from '@/components/Button'
import EmptyState from '@/components/EmptyState'
import Input from '@/components/Input'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusBadge from '@/components/StatusBadge'
import { useLocaleFormat } from '@/utils/format'
import type { BillStatus } from '@/types'

const billPaymentTypeKeys: Record<string, 'payment.cash' | 'payment.qr' | 'payment.bankTransfer'> = {
  Cash: 'payment.cash',
  Qr: 'payment.qr',
  BankTransfer: 'payment.bankTransfer',
}

export default function BillsListPage({ basePath }: { basePath: '/cashier' | '/owner' }) {
  const navigate = useNavigate()
  const { formatMoney, formatDateTime } = useLocaleFormat()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<BillStatus | ''>('')
  const { data: bills = [], isLoading } = useBills(date, status || undefined)
  const { t } = useTranslation('bills')

  const paymentTypeLabel = (raw: string) => {
    const key = billPaymentTypeKeys[raw]
    return key ? t(key) : raw
  }

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="app-page space-y-4">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('title')}</h1>
        </div>
      </div>

      <div className="soft-panel flex flex-wrap items-end gap-2 p-3">
        <Input label={t('filter.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          {(['', 'Paid', 'Voided'] as Array<BillStatus | ''>).map((value) => (
            <Button key={value || 'all'} variant={status === value ? 'primary' : 'secondary'} onClick={() => setStatus(value)}>
              {value ? (value === 'Paid' ? t('status.paid') : t('status.voided')) : t('list.all')}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {bills.length === 0 ? (
          <EmptyState title={t('list.empty')} />
        ) : (
          bills.map((bill) => (
            <button
              key={bill.id}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] p-4 text-left shadow-[var(--shadow-card)] transition hover:border-[rgba(0,117,222,0.26)] hover:shadow-[var(--shadow-deep)]"
              onClick={() => navigate(`${basePath}/bills/${bill.id}`)}
            >
              <div>
                <p className="font-bold">{bill.billNumber} - {bill.tableName}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  {paymentTypeLabel(bill.paymentType)} / {formatDateTime(bill.paidAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-extrabold">{formatMoney(bill.totalAmount)}</p>
                <StatusBadge status={bill.status} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
