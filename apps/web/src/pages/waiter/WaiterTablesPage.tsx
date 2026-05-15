import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTables } from '@/features/tables'
import { useCreateOrder } from '@/features/orders'
import { tablesApi } from '@/features/tables'
import StatusBadge from '@/components/StatusBadge'
import type { RestaurantTable } from '@/types'

export default function WaiterTablesPage() {
  const navigate = useNavigate()
  const { data: tables = [] } = useTables()
  const createOrderMutation = useCreateOrder()
  const { t } = useTranslation('tables')

  const openTable = async (table: RestaurantTable) => {
    try {
      const active = await tablesApi.getActiveOrder(table.id)
      navigate(`/waiter/orders/${active.id}`)
    } catch {
      const created = await createOrderMutation.mutateAsync(table.id)
      navigate(`/waiter/orders/${created.id}`)
    }
  }

  return (
    <div className="app-page">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-subtitle">{t('waiter.subtitle')}</p>
        </div>
        <span className="rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-1 text-xs font-semibold text-[var(--color-on-surface-variant)]">
          {t('summary.total', { count: tables.length })}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((table) => (
          <button key={table.id} className="table-tile p-4 text-left" onClick={() => openTable(table)}>
            <div className="flex h-full flex-col justify-between gap-4">
              <div>
                <p className="text-lg font-extrabold text-[var(--color-on-surface)]">{table.name}</p>
                <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">{t('waiter.openHint')}</p>
              </div>
              <StatusBadge status={table.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
