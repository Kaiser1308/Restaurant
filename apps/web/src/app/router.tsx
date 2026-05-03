import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute, RoleRoute } from '@/components/ProtectedRoute'
import WaiterLayout from '@/layouts/WaiterLayout'
import CashierLayout from '@/layouts/CashierLayout'
import OwnerLayout from '@/layouts/OwnerLayout'
import LoginPage from '@/pages/LoginPage'
import HomeRedirect from '@/pages/HomeRedirect'
import ReportsPage from '@/pages/shared/ReportsPage'
import ComingSoonPage from '@/pages/shared/ComingSoonPage'
import WaiterTablesPage from '@/pages/waiter/WaiterTablesPage'
import WaiterOrderPage from '@/pages/waiter/WaiterOrderPage'
import CashierTablesPage from '@/pages/cashier/CashierTablesPage'
import CashierPaymentPage from '@/pages/cashier/CashierPaymentPage'
import BillsListPage from '@/pages/shared/BillsListPage'
import BillDetailPage from '@/pages/shared/BillDetailPage'
import OwnerDashboardPage from '@/pages/owner/OwnerDashboardPage'
import KitchenPage from '@/pages/owner/KitchenPage'
import AuditLogsPage from '@/pages/owner/AuditLogsPage'

export function AppRouter() {
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
