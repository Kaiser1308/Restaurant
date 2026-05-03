import { useTranslation } from 'react-i18next'
import { useKitchenOrders } from '@/features/orders'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'

export default function KitchenPage() {
  const { data: orders = [] } = useKitchenOrders()
  const { t } = useTranslation('common')
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">{t('kitchen.title')}</h2>
      {(orders as Array<NonNullable<typeof orders[number]>>).map(order => (
        <Card key={order.id}>
          <p className="font-semibold">{order.tableName} - <StatusBadge status={order.status} /></p>
          {order.items.map(item => (
            <p key={item.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {item.itemNameSnapshot}{' '}
                {t('labels.quantityTimes', { qty: item.quantity })}
              </span>
              <StatusBadge status={item.status} />
            </p>
          ))}
        </Card>
      ))}
    </div>
  )
}
