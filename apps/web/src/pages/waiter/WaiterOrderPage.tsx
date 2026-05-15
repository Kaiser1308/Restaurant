import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrderDetail } from '@/features/orders'
import { useCategories, useMenuItems } from '@/features/menu'
import { ordersApi } from '@/features/orders'
import Button from '@/components/Button'
import ConfirmDialog from '@/components/ConfirmDialog'
import EmptyState from '@/components/EmptyState'
import Input from '@/components/Input'
import Card from '@/components/Card'
import QuantityStepper from '@/components/QuantityStepper'
import StatusBadge from '@/components/StatusBadge'
import Textarea from '@/components/Textarea'
import Toast from '@/components/Toast'
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
  const [cancelItemId, setCancelItemId] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const { t } = useTranslation(['orders', 'common', 'menu'])
  const { formatMoney } = useLocaleFormat()
  const [toastMessage, setToastMessage] = useState<{ type: 'error' | 'warning' | 'success'; message: string } | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['orderDetail', orderId] })

  const addItem = useMutation({
    mutationFn: (menuItemId: string) => ordersApi.addItem(orderId, menuItemId, 1),
    onSuccess: refresh,
    onError: () => setToastMessage({ type: 'error', message: t('errors.addItemFailed') }),
  })
  const updateItem = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => ordersApi.updateItem(itemId, quantity),
    onSuccess: refresh,
    onError: () => setToastMessage({ type: 'error', message: t('errors.updateItemFailed') }),
  })
  const cancelItem = useMutation({
    mutationFn: ({ itemId, reason }: { itemId: string; reason: string }) => ordersApi.cancelItem(itemId, reason),
    onSuccess: () => {
      setCancelItemId('')
      setCancelReason('')
      refresh()
    },
    onError: () => setToastMessage({ type: 'error', message: t('errors.cancelItemFailed') }),
  })
  const sendToKitchen = useMutation({
    mutationFn: () => ordersApi.sendToKitchen(orderId),
    onSuccess: refresh,
    onError: () => setToastMessage({ type: 'error', message: t('errors.sendToKitchenFailed') }),
  })

  if (!order) {
    return <p>{t('loading')}</p>
  }

  return (
    <div className="app-page grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[var(--color-primary)]">{t('items.title')}</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight text-[var(--color-on-surface)]">{order.tableName}</h1>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {order.items.length === 0 ? (
            <EmptyState title={t('items.emptyTitle')} description={t('items.emptyDescription')} />
          ) : null}

          {order.items.map((item) => (
            <div key={item.id} className="rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[var(--color-on-surface)]">{item.itemNameSnapshot}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface-variant)]">{formatMoney(item.lineTotal)}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              {item.status === 'Pending' ? (
                <div className="mt-3 space-y-2">
                  <QuantityStepper
                    value={item.quantity}
                    decreaseLabel={t('actions.decrease')}
                    increaseLabel={t('actions.increase')}
                    onChange={(quantity) => updateItem.mutate({ itemId: item.id, quantity })}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setCancelItemId(item.id)}
                  >
                    {t('actions.cancelItem')}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-outline-variant)] pt-4">
            <div>
              <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{t('items.title')}</p>
              <p className="text-2xl font-extrabold">{formatMoney(order.totalAmount)}</p>
            </div>
            <Button onClick={() => sendToKitchen.mutate()} disabled={sendToKitchen.isPending}>
              {t('actions.sendToKitchen')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-4">
          <Input placeholder={t('placeholder.searchMenu')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
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
          {categories.length === 0 ? (
            <EmptyState title={t('categories.emptyTitle')} description={t('categories.emptyDescription')} />
          ) : null}

          {categories.length > 0 && menuItems.length === 0 ? (
            <EmptyState title={t('menu.emptyTitle')} description={t('menu.emptyDescription')} />
          ) : null}

          {menuItems.map((item) => (
            <div key={item.id} className="grid grid-cols-[96px_1fr] gap-3 rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
              <div className="aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-low)]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-on-surface-variant)]">
                    {t('menuItem.noImage', { ns: 'menu' })}
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-between gap-2">
                <div>
                  <p className="truncate font-bold">{item.name}</p>
                  <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{formatMoney(item.price)}</p>
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

      <ConfirmDialog
        open={Boolean(cancelItemId)}
        title={t('actions.cancelItem')}
        description={t('actions.cancelItemDescription')}
        confirmLabel={t('actions.cancelItem')}
        cancelLabel={t('common:actions.cancel')}
        confirmVariant="danger"
        disabled={!cancelReason.trim() || cancelItem.isPending}
        onCancel={() => {
          setCancelItemId('')
          setCancelReason('')
        }}
        onConfirm={() => cancelItem.mutate({ itemId: cancelItemId, reason: cancelReason.trim() })}
      >
        <Textarea
          label={t('actions.cancelReason')}
          placeholder={t('actions.reasonPlaceholder')}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </ConfirmDialog>
      {toastMessage ? (
        <Toast variant={toastMessage.type} message={toastMessage.message} onClose={() => setToastMessage(null)} />
      ) : null}
    </div>
  )
}
