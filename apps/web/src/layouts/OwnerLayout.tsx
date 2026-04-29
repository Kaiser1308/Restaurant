import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { canManageMenu, canManageTables } from '@/features/auth/utils/roleAccess'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()
  const userRole = currentUser?.role ?? 'Waiter'
  const canViewStaff = userRole === 'Owner'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      <aside className="hidden w-72 flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:flex">
        <div className="border-b border-[var(--color-outline-variant)] px-4 py-4">
          <p className="text-base font-bold text-[var(--color-on-surface)]">Restaurant POS</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          <NavLink to="/owner/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Dashboard</NavLink>
          <NavLink to="/owner/kitchen" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Kitchen</NavLink>
          {canManageTables(userRole) ? (
            <NavLink to="/owner/tables" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Bàn</NavLink>
          ) : null}
          {canManageMenu(userRole) ? (
            <NavLink to="/owner/menu" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Menu</NavLink>
          ) : null}
          {canViewStaff ? (
            <NavLink to="/owner/staff" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Nhân viên</NavLink>
          ) : null}
          <NavLink to="/owner/reports" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">Báo cáo</NavLink>
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
