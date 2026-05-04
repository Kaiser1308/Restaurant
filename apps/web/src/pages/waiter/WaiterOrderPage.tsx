import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrderDetail } from '@/features/orders'
import { useLatestPrintJob } from '@/features/print-jobs'
import { useCategories, useMenuItems } from '@/features/menu'
import { ordersApi } from '@/features/orders'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'
import { useLocaleFormat } from '@/utils/format'
import { useState } from 'react'

export default function WaiterOrderPage() {
  const { orderId = '' } = useParams()
  const queryClient = useQueryClient()
  const { data: order } = useOrderDetail(orderId)
  const { data: categories = [] } = useCategories()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const { data: menuItems = [] } = useMenuItems(selectedCategoryId, search)
  const [reasonByItem, setReasonByItem] = useState<Record<string, string>>({})
  const { t } = useTranslation('orders')
  const { formatMoney } = useLocaleFormat()
  const shouldPollKitchenPrint = order?.status === 'SentToKitchen' || order?.status === 'Paid'
  const { data: kitchenPrintJob, isLoading: isPrintJobLoading, isError: isPrintJobError } = useLatestPrintJob({
    entityType: 'order',
    entityId: shouldPollKitchenPrint ? order?.id : undefined,
    printerType: 'Kitchen',
  })

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['orderDetail', orderId] })

  const addItem = useMutation({
    mutationFn: (menuItemId: string) => ordersApi.addItem(orderId, menuItemId, 1),
    onSuccess: refresh,
  })
  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => ordersApi.updateItem(itemId, quantity),
    onSuccess: refresh,
  })
  const cancelItem = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) => ordersApi.cancelItem(itemId, reason),
    onSuccess: refresh,
  })
  const sendToKitchen = useMutation({
    mutationFn: () => ordersApi.sendToKitchen(orderId),
    onSuccess: refresh,
  })

  if (!order) {
    return <p>{t('loading')}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <div className="space-y-3">
          <p className="text-xl font-bold">{order.tableName}</p>
          <p className="text-sm">{t('statusLabel')}: <StatusBadge status={order.status} /></p>
          {shouldPollKitchenPrint ? (
            <div className="rounded border border-[var(--color-outline-variant)] bg-[var(--color-surface-low)] px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{t('printStatus.title')}</span>
                <span>
                  {kitchenPrintJob ? t(`printStatus.status.${kitchenPrintJob.status}`) : isPrintJobLoading ? t('printStatus.loading') : t('printStatus.notFound')}
                </span>
              </div>
              {isPrintJobError ? <p className="mt-1 text-xs text-[var(--color-error)]">{t('printStatus.notFound')}</p> : null}
            </div>
          ) : null}
          {order.items.map(item => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.itemNameSnapshot}</p>
              <p className="text-sm">
                <StatusBadge status={item.status} /> {t('lineItem.betweenStatusAndAmount')} {formatMoney(item.lineTotal)}
              </p>
              {item.status === 'Pending' || item.status === 'SentToKitchen' ? (
                <div className="mt-2 space-y-2">
                  {item.status === 'Pending' ? (
                    <div className="flex gap-2">
                    <Button
                      size="sm"
                      aria-label={t('actions.decrease')}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                    >
                      −
                    </Button>
                    <span className="px-2 py-2">{item.quantity}</span>
                    <Button
                      size="sm"
                      aria-label={t('actions.increase')}
                      onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                    >
                      +
                    </Button>
                    </div>
                  ) : null}
                  <Input
                    placeholder={t('actions.reasonPlaceholder')}
                    value={reasonByItem[item.id] || ''}
                    onChange={(e) => setReasonByItem(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelItem.mutate({ itemId: item.id, reason: (reasonByItem[item.id] || '').trim() })}
                  >
                    {t('actions.cancelItem')}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          <p className="font-bold">{t('items.title')}: {formatMoney(order.totalAmount)}</p>
          <Button onClick={() => sendToKitchen.mutate()} disabled={sendToKitchen.isPending}>{t('actions.sendToKitchen')}</Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <Input placeholder={t('placeholder.searchMenu')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.id}
                size="sm"
                variant={selectedCategoryId === category.id ? 'primary' : 'ghost'}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          {menuItems.map(item => (
            <div key={item.id} className="grid grid-cols-[96px_1fr] gap-3 rounded border p-3">
              <div className="aspect-square overflow-hidden rounded-md bg-stone-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone-500">
                    {t('menuItem.noImage', { ns: 'menu' })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm">{formatMoney(item.price)}</p>
                </div>
                <Button
                  size="sm"
                  disabled={!item.isAvailable || addItem.isPending}
                  onClick={() => addItem.mutate(item.id)}
                >
                  {t('actions.addItem')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
