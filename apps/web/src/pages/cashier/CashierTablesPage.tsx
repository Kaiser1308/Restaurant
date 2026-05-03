import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useTables } from '@/features/tables'
import { tablesApi } from '@/features/tables'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'
import type { RestaurantTable } from '@/types'

export default function CashierTablesPage() {
  const navigate = useNavigate()
  const { data: tables = [] } = useTables()
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tables.map((table) => (
          <button
            key={table.id}
            className="rounded-lg border p-4 text-left disabled:opacity-50"
            disabled={table.status !== 'Occupied' && table.status !== 'NeedsPayment'}
            onClick={() => openPayment(table)}
          >
            <p className="font-semibold">{table.name}</p>
            <StatusBadge status={table.status} />
          </button>
        ))}
      </div>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </div>
  )
}
