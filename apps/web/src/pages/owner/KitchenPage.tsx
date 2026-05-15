import { useTranslation } from 'react-i18next'
import { useKitchenOrders } from '@/features/orders'
import Card from '@/components/Card'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'
import StatusBadge from '@/components/StatusBadge'

export default function KitchenPage() {
  const { data: orders = [], isLoading } = useKitchenOrders()
  const { t } = useTranslation('common')

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="app-page space-y-3">
      <div className="page-heading">
        <div>
          <h1 className="page-title">{t('kitchen.title')}</h1>
        </div>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          title={t('kitchen.emptyTitle')}
          description={t('kitchen.emptyDescription')}
        />
      ) : (
        (orders as Array<NonNullable<typeof orders[number]>>).map(order => (
          <Card key={order.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xl font-extrabold">{order.tableName}</p>
              <StatusBadge status={order.status} />
            </div>
            <div className="space-y-2">
              {order.items.map(item => (
                <p key={item.id} className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
                  <span className="font-semibold">
                    {item.itemNameSnapshot}{' '}
                    {t('labels.quantityTimes', { qty: item.quantity })}
                  </span>
                  <StatusBadge status={item.status} />
                </p>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}
