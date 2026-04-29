import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-16 md:pb-0">
      <header className="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-4 py-3">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="rounded-lg border border-[var(--color-outline-variant)] px-3 py-1.5 text-sm font-semibold text-[var(--color-on-surface)]"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl p-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] md:hidden">
        <div className="grid grid-cols-3 gap-1 px-2 py-2">
          <NavLink to="/waiter/tables" className="rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--color-on-surface)]">
            Bàn
          </NavLink>
          <NavLink to="/waiter/orders" className="rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--color-on-surface)]">
            Đơn hàng
          </NavLink>
          <NavLink to="/waiter/profile" className="rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--color-on-surface)]">
            Profile
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
