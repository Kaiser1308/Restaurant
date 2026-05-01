import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, RoleRoute } from './components/ProtectedRoute'
import { useAuth } from './features/auth/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import i18n from './i18n'
import Button from './components/Button'
import Input from './components/Input'
import Card from './components/Card'
import Modal from './components/Modal'
import StatusBadge from './components/StatusBadge'
import WaiterLayout from './layouts/WaiterLayout'
import CashierLayout from './layouts/CashierLayout'
import OwnerLayout from './layouts/OwnerLayout'
import type { LoginRequest } from '@/types'
import { useState } from 'react'
import { getDefaultPathByRole } from '@/features/auth/utils/roleAccess'
import Toast from './components/Toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuditLogs, useBill, useBillPreview, useBills, useCategories, useCreateOrder, useKitchenOrders, useMenuItems, useOrderDetail, useTables } from '@/features/pos/hooks/usePosData'
import { tablesApi } from '@/features/tables/api/tablesApi'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { menuApi } from '@/features/menu/api/menuApi'
import { billsApi } from '@/features/bills/api/billsApi'
import type { BillStatus, PaymentType, RestaurantTable } from '@/types'
import { useLocaleFormat } from '@/utils/format'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

function LoginPage() {
  const { login, isLoginLoading } = useAuth()
  const { t } = useTranslation('auth')
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' })
  const [toastMessage, setToastMessage] = useState<string>(() => {
    const notice = sessionStorage.getItem('authNotice')
    if (notice) {
      sessionStorage.removeItem('authNotice')
      if (notice === '__SESSION_EXPIRED__') {
        return i18n.t('common:sessionExpired')
      }
      return notice
    }
    return ''
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedUsername = form.username.trim()
    const normalizedPassword = form.password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setToastMessage(t('actions.invalidCredentials'))
      return
    }

    try {
      const result = await login({
        username: normalizedUsername,
        password: normalizedPassword,
      })
      window.location.href = getDefaultPathByRole(result.user.role)
    } catch {
      setToastMessage(t('actions.loginFailed'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="text-center space-y-2">
            <span className="mx-auto inline-flex rounded-full border border-[#ffd3bf] bg-[#fff2eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              {t('login.cashierDemo')}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">{t('login.restaurantPos')}</h1>
            <p className="font-medium text-[var(--color-on-surface-variant)]">{t('login.welcome')}</p>
          </div>

          <div className="space-y-4">
            <Input
              label={t('labels.username')}
              placeholder={t('login.usernamePlaceholder')}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              label={t('labels.password')}
              type="password"
              placeholder={t('login.passwordMaskPlaceholder')}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button className="w-full" size="lg" type="submit" disabled={isLoginLoading}>
              {isLoginLoading ? t('actions.loggingIn') : t('actions.login')}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">{t('login.actions.qrScan')}</Button>
              <Button variant="ghost" className="flex-1">{t('login.actions.support')}</Button>
            </div>
          </div>
        </form>
      </Card>
      {toastMessage ? (
        <Toast
          message={toastMessage}
          variant="error"
          onClose={() => setToastMessage('')}
        />
      ) : null}
    </div>
  )
}

function HomeRedirect() {
  const { currentUser } = useAuth()

  return <Navigate to={getDefaultPathByRole(currentUser?.role)} replace />
}

function WaiterTablesPage() {
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

function WaiterOrderPage() {
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
          {order.items.map(item => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.itemNameSnapshot}</p>
              <p className="text-sm">
                <StatusBadge status={item.status} /> {t('lineItem.betweenStatusAndAmount')} {formatMoney(item.lineTotal)}
              </p>
              {item.status === 'Pending' ? (
                <div className="mt-2 space-y-2">
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

function CashierTablesPage() {
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

function CashierPaymentPage() {
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

const billPaymentTypeKeys: Record<string, 'payment.cash' | 'payment.qr' | 'payment.bankTransfer'> = {
  Cash: 'payment.cash',
  Qr: 'payment.qr',
  BankTransfer: 'payment.bankTransfer',
}

function BillsListPage({ basePath }: { basePath: '/cashier' | '/owner' }) {
  const navigate = useNavigate()
  const { formatMoney, formatDateTime } = useLocaleFormat()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<BillStatus | ''>('')
  const { data: bills = [] } = useBills(date, status || undefined)
  const { t } = useTranslation('bills')

  const paymentTypeLabel = (raw: string) => {
    const key = billPaymentTypeKeys[raw]
    return key ? t(key) : raw
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <div className="flex flex-wrap items-end gap-2">
        <Input label={t('filter.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="flex gap-2">
          {(['', 'Paid', 'Voided'] as Array<BillStatus | ''>).map(value => (
            <Button key={value || 'all'} variant={status === value ? 'primary' : 'secondary'} onClick={() => setStatus(value)}>
              {value ? (value === 'Paid' ? t('status.paid') : t('status.voided')) : t('list.all')}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {bills.map(bill => (
          <button
            key={bill.id}
            className="flex w-full items-center justify-between rounded border p-3 text-left"
            onClick={() => navigate(`${basePath}/bills/${bill.id}`)}
          >
            <div>
              <p className="font-semibold">{bill.billNumber} - {bill.tableName}</p>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                {paymentTypeLabel(bill.paymentType)} · {formatDateTime(bill.paidAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatMoney(bill.totalAmount)}</p>
              <StatusBadge status={bill.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function BillDetailPage({ canVoid }: { canVoid: boolean }) {
  const queryClient = useQueryClient()
  const { billId = '' } = useParams()
  const { data: bill } = useBill(billId)
  const [voidOpen, setVoidOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const { formatMoney, formatDateTime } = useLocaleFormat()
  const { t } = useTranslation('bills')
  const { t: tCommon } = useTranslation('common')

  const voidBill = useMutation({
    mutationFn: () => billsApi.void(billId, reason.trim()),
    onSuccess: async () => {
      setVoidOpen(false)
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['bill', billId] })
      await queryClient.invalidateQueries({ queryKey: ['bills'] })
      await queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: () => setToastMessage(t('errors.voidFailed')),
  })

  if (!bill) {
    return <p>{t('loading.detail')}</p>
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">{t('title')} {bill.billNumber}</p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">{bill.tableName} · {formatDateTime(bill.paidAt)}</p>
          </div>
          <StatusBadge status={bill.status} />
        </div>
        {bill.items.map(item => (
          <div key={item.id} className="flex justify-between rounded border p-3">
            <p>
              {item.itemNameSnapshot}{' '}
              {tCommon('labels.quantityTimes', { qty: item.quantity })}
            </p>
            <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 text-lg font-bold">
          <span>{t('preview.totalAmount')}</span>
          <span>{formatMoney(bill.totalAmount)}</span>
        </div>
        {bill.voidReason ? <p className="text-sm text-[var(--color-error)]">{t('actions.voidReason')}: {bill.voidReason}</p> : null}
        {canVoid && bill.status === 'Paid' ? (
          <Button variant="danger" onClick={() => setVoidOpen(true)}>{t('actions.void')}</Button>
        ) : null}
      </div>

      <Modal open={voidOpen}>
        <div className="space-y-4">
          <p className="text-lg font-bold">{t('actions.voidWithNumber', { billNumber: bill.billNumber })}</p>
          <Input label={t('actions.voidReason')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('actions.voidPlaceholder')} />
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setVoidOpen(false)}>{t('common:actions.cancel')}</Button>
            <Button variant="danger" className="flex-1" disabled={!reason.trim() || voidBill.isPending} onClick={() => voidBill.mutate()}>
              {t('actions.confirmVoid')}
            </Button>
          </div>
        </div>
      </Modal>
      {toastMessage ? <Toast message={toastMessage} variant="error" onClose={() => setToastMessage('')} /> : null}
    </Card>
  )
}

function AuditLogsPage() {
  const [action, setAction] = useState('')
  const { formatDateTime } = useLocaleFormat()
  const { data } = useAuditLogs({ action: action || undefined, page: 1, pageSize: 50 })
  const logs = data?.items ?? []
  const { t } = useTranslation('audit')

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <div className="flex items-end gap-2">
        <Input label={t('log.action')} value={action} onChange={(e) => setAction(e.target.value)} placeholder={t('placeholder.actionFilter')} />
        <Button variant="secondary" onClick={() => setAction('')}>{t('actions.clearFilter')}</Button>
      </div>
      <div className="space-y-2">
        {logs.map(log => (
          <Card key={log.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{log.action}</p>
                <p className="text-sm text-[var(--color-on-surface-variant)]">
                  {log.entityType} · {log.entityId} · {log.userName || t('log.systemUser')}
                </p>
                {log.reason ? <p className="mt-1 text-sm">{t('log.reason')}: {log.reason}</p> : null}
              </div>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{formatDateTime(log.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function OwnerDashboardPage() {
  const queryClient = useQueryClient()
  const { data: tables = [] } = useTables()
  const [tableName, setTableName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('50000')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [menuFormError, setMenuFormError] = useState('')
  const { data: categories = [] } = useCategories()
  const { t } = useTranslation(['tables', 'menu', 'common'])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedImage(event.target.files?.[0] ?? null)
    setMenuFormError('')
  }

  const createTable = useMutation({
    mutationFn: () => tablesApi.create(tableName.trim()),
    onSuccess: () => {
      setTableName('')
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
  const createCategory = useMutation({
    mutationFn: () => menuApi.createCategory({ name: categoryName.trim(), sortOrder: 1 }),
    onSuccess: () => {
      setCategoryName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
  const createMenuItem = useMutation({
    mutationFn: async () => {
      const savedItem = await menuApi.createMenuItem({
        categoryId: categories[0]?.id || '',
        name: menuName.trim(),
        price: Number(menuPrice),
        isAvailable: true,
      })

      if (selectedImage) {
        await menuApi.uploadMenuItemImage(savedItem.id, selectedImage)
      }

      return savedItem
    },
    onSuccess: () => {
      setMenuName('')
      setMenuPrice('50000')
      setSelectedImage(null)
      setMenuFormError('')
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
    onError: () => {
      setMenuFormError(t('menu:menuItem.imageUploadError'))
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">{t('tables:management')}</p>
        <div className="flex gap-2">
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={t('tables:placeholder.tableName')} />
          <Button onClick={() => createTable.mutate()} disabled={!tableName.trim()}>{t('common:actions.create')}</Button>
        </div>
        <div className="mt-3 space-y-2">
          {tables.map(tbl => <p key={tbl.id}>{tbl.name} - <StatusBadge status={tbl.status} /></p>)}
        </div>
      </Card>
      <Card>
        <p className="mb-2 font-semibold">{t('menu:management')}</p>
        <div className="mb-2 flex gap-2">
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={t('menu:category.createPlaceholder')} />
          <Button onClick={() => createCategory.mutate()} disabled={!categoryName.trim()}>{t('menu:category.create')}</Button>
        </div>
        <div className="flex gap-2">
          <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder={t('menu:menuItem.createPlaceholder')} />
          <Input value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} placeholder={t('common:labels.price')} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <Button onClick={() => createMenuItem.mutate()} disabled={!menuName.trim() || categories.length === 0}>{t('menu:menuItem.create')}</Button>
        </div>
        {menuFormError ? <p className="mt-2 text-sm text-red-600">{menuFormError}</p> : null}
      </Card>
    </div>
  )
}

function ComingSoonPage({ navKey }: { navKey: 'nav.tables' | 'nav.menu' | 'nav.staff' }) {
  const { t } = useTranslation('common')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t(navKey)}</h2>
      <Card>
        <p className="text-sm text-[var(--color-on-surface-variant)]">{t('comingSoon')}</p>
      </Card>
    </div>
  )
}

function ReportsPage() {
  const { t } = useTranslation('reports')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t('title')}</h2>
      <Card>
        <p className="text-sm text-[var(--color-on-surface-variant)]">{t('placeholder.noData')}</p>
      </Card>
    </div>
  )
}

function KitchenPage() {
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

function AppContent() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<RoleRoute allowedRoles={['Waiter']} />}>
          <Route
            path="/waiter/*"
            element={
              <WaiterLayout>
                <Routes>
                  <Route path="" element={<Navigate to="tables" replace />} />
                  <Route path="tables" element={<WaiterTablesPage />} />
                  <Route path="orders" element={<Navigate to="/waiter/tables" replace />} />
                  <Route path="orders/:orderId" element={<WaiterOrderPage />} />
                </Routes>
              </WaiterLayout>
            }
          />
        </Route>

        <Route element={<RoleRoute allowedRoles={['Cashier']} />}>
          <Route
            path="/cashier/*"
            element={
              <CashierLayout>
                <Routes>
                  <Route path="" element={<Navigate to="tables" replace />} />
                  <Route path="tables" element={<CashierTablesPage />} />
                  <Route path="orders/:orderId/payment" element={<CashierPaymentPage />} />
                  <Route path="bills" element={<BillsListPage basePath="/cashier" />} />
                  <Route path="bills/:billId" element={<BillDetailPage canVoid={false} />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Routes>
              </CashierLayout>
            }
          />
        </Route>

        <Route element={<RoleRoute allowedRoles={['Owner', 'Manager']} />}>
          <Route
            path="/owner/*"
            element={
              <OwnerLayout>
                <Routes>
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<OwnerDashboardPage />} />
                  <Route path="kitchen" element={<KitchenPage />} />
                  <Route path="bills" element={<BillsListPage basePath="/owner" />} />
                  <Route path="bills/:billId" element={<BillDetailPage canVoid />} />
                  <Route path="audit" element={<AuditLogsPage />} />
                  <Route path="tables" element={<ComingSoonPage navKey="nav.tables" />} />
                  <Route path="menu" element={<ComingSoonPage navKey="nav.menu" />} />
                  <Route path="staff" element={<ComingSoonPage navKey="nav.staff" />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Routes>
              </OwnerLayout>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
