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
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {tables.map((table) => (
          <button key={table.id} className="rounded-lg border p-4 text-left" onClick={() => openTable(table)}>
            <p className="font-semibold">{table.name}</p>
            <StatusBadge status={table.status} />
          </button>
        ))}
      </div>
    </div>
  )
}
