import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useTables } from '@/features/tables'
import { tablesApi } from '@/features/tables'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { RestaurantTable } from '@/types'

export default function CashierTablesPage() {
  const navigate = useNavigate()
  const { data: tables = [], isLoading } = useTables()
  const { t } = useTranslation('tables')
  const [toastMessage, setToastMessage] = useState('')

  const openPayment = async (table: RestaurantTable) => {
    try {
      const active = await tablesApi.getActiveOrder(table.id)
      navigate(`/cashier/orders/${active.id}/payment`)
    } catch {
      setToastMessage(t('errors.noActiveOrder'))
    }
  }

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('cashier.subtitle')}</p>
        </div>
        <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
          {t('summary.actionable', { count: tables.filter((table) => table.status === 'Occupied' || table.status === 'NeedsPayment').length })}
        </span>
      </div>
      {tables.length === 0 ? (
        <EmptyState title={t('cashier.emptyTitle')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tables.map((table) => (
            <button
              key={table.id}
              className="table-tile p-4 text-left"
              disabled={table.status !== 'Occupied' && table.status !== 'NeedsPayment'}
              onClick={() => openPayment(table)}
            >
              <div className="flex h-full flex-col justify-between gap-4">
                <div>
                  <p className="text-lg font-extrabold text-[var(--color-on-surface)]">{table.name}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">{t('cashier.openHint')}</p>
                </div>
                <StatusBadge status={table.status} />
              </div>
            </button>
          ))}
        </div>
      )}
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
