import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-64 flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:flex">
        <div className="border-b border-[var(--color-outline-variant)] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          <NavLink to="/cashier/tables" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">
            Sơ đồ bàn
          </NavLink>
          <NavLink to="/cashier/bills" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">
            Hóa đơn
          </NavLink>
          <NavLink to="/cashier/reports" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">
            Báo cáo nhanh
          </NavLink>
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)]"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
