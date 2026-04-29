import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, RoleRoute } from './components/ProtectedRoute'
import { useAuth } from './features/auth/hooks/useAuth'
import Button from './components/Button'
import Input from './components/Input'
import Card from './components/Card'
import WaiterLayout from './layouts/WaiterLayout'
import CashierLayout from './layouts/CashierLayout'
import OwnerLayout from './layouts/OwnerLayout'
import type { LoginRequest } from '@/types'
import { useEffect, useState } from 'react'
import { getDefaultPathByRole } from '@/features/auth/utils/roleAccess'
import Toast from './components/Toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCategories, useCreateOrder, useKitchenOrders, useMenuItems, useOrderDetail, useTables } from '@/features/pos/hooks/usePosData'
import { tablesApi } from '@/features/tables/api/tablesApi'
import { ordersApi } from '@/features/orders/api/ordersApi'
import { menuApi } from '@/features/menu/api/menuApi'
import type { RestaurantTable } from '@/types'

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
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' })
  const [toastMessage, setToastMessage] = useState<string>('')

  useEffect(() => {
    const authNotice = sessionStorage.getItem('authNotice')
    if (!authNotice) {
      return
    }

    setToastMessage(authNotice)
    sessionStorage.removeItem('authNotice')
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedUsername = form.username.trim()
    const normalizedPassword = form.password.trim()

    if (!normalizedUsername || !normalizedPassword) {
      setToastMessage('Vui lòng nhập tài khoản và mật khẩu hợp lệ.')
      return
    }

    try {
      const result = await login({
        username: normalizedUsername,
        password: normalizedPassword,
      })
      window.location.href = getDefaultPathByRole(result.user.role)
    } catch {
      setToastMessage('Đăng nhập thất bại. Vui lòng kiểm tra tài khoản hoặc mật khẩu.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="text-center space-y-2">
            <span className="mx-auto inline-flex rounded-full border border-[#ffd3bf] bg-[#fff2eb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
              Cashier Demo
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-on-surface)]">Restaurant POS</h1>
            <p className="font-medium text-[var(--color-on-surface-variant)]">Chào mừng anh quay trở lại!</p>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Tài khoản"
              placeholder="Nhập tên đăng nhập..."
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button className="w-full" size="lg" type="submit" disabled={isLoginLoading}>
              {isLoginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">Quét QR</Button>
              <Button variant="ghost" className="flex-1">Hỗ trợ</Button>
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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {tables.map((table) => (
        <button key={table.id} className="rounded-lg border p-4 text-left" onClick={() => openTable(table)}>
          <p className="font-semibold">{table.name}</p>
          <p className="text-sm text-[var(--color-on-surface-variant)]">{table.status}</p>
        </button>
      ))}
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
    return <p>Loading order...</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <div className="space-y-3">
          <p className="text-xl font-bold">{order.tableName}</p>
          <p className="text-sm">Status: {order.status}</p>
          {order.items.map(item => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.itemNameSnapshot}</p>
              <p className="text-sm">{item.status} - {item.lineTotal.toLocaleString('vi-VN')}đ</p>
              {item.status === 'Pending' ? (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateItem.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}>-</Button>
                    <span className="px-2 py-2">{item.quantity}</span>
                    <Button size="sm" onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}>+</Button>
                  </div>
                  <Input
                    placeholder="Lý do hủy"
                    value={reasonByItem[item.id] || ''}
                    onChange={(e) => setReasonByItem(prev => ({ ...prev, [item.id]: e.target.value }))}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => cancelItem.mutate({ itemId: item.id, reason: (reasonByItem[item.id] || '').trim() })}
                  >
                    Hủy món
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          <p className="font-bold">Total: {order.totalAmount.toLocaleString('vi-VN')}đ</p>
          <Button onClick={() => sendToKitchen.mutate()} disabled={sendToKitchen.isPending}>Send to Kitchen</Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <Input placeholder="Search menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <div key={item.id} className="rounded border p-3">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm">{item.price.toLocaleString('vi-VN')}đ</p>
              <Button
                size="sm"
                disabled={!item.isAvailable || addItem.isPending}
                onClick={() => addItem.mutate(item.id)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      </Card>
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
  const { data: categories = [] } = useCategories()

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
    mutationFn: () => menuApi.createMenuItem({
      categoryId: categories[0]?.id || '',
      name: menuName.trim(),
      price: Number(menuPrice),
      isAvailable: true,
    }),
    onSuccess: () => {
      setMenuName('')
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">Table Management</p>
        <div className="flex gap-2">
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table name" />
          <Button onClick={() => createTable.mutate()} disabled={!tableName.trim()}>Create</Button>
        </div>
        <div className="mt-3 space-y-2">
          {tables.map(t => <p key={t.id}>{t.name} - {t.status}</p>)}
        </div>
      </Card>
      <Card>
        <p className="mb-2 font-semibold">Menu Management</p>
        <div className="mb-2 flex gap-2">
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
          <Button onClick={() => createCategory.mutate()} disabled={!categoryName.trim()}>Create Category</Button>
        </div>
        <div className="flex gap-2">
          <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder="Menu item name" />
          <Input value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} placeholder="Price" />
          <Button onClick={() => createMenuItem.mutate()} disabled={!menuName.trim() || categories.length === 0}>Create Item</Button>
        </div>
      </Card>
    </div>
  )
}

function KitchenPage() {
  const { data: orders = [] } = useKitchenOrders()
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Kitchen Display</h2>
      {(orders as Array<NonNullable<typeof orders[number]>>).map(order => (
        <Card key={order.id}>
          <p className="font-semibold">{order.tableName} - {order.status}</p>
          {order.items.map(item => (
            <p key={item.id}>{item.itemNameSnapshot} x {item.quantity} ({item.status})</p>
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
                  <Route path="tables" element={<WaiterTablesPage />} />
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
