import { NavLink, useNavigate } from 'react-router-dom'
import { canManageMenu, canManageTables, useAuth } from '@/features/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { currentUser, logout, isLogoutLoading } = useAuth()
  const { t } = useTranslation(['common', 'auth'])
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
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-[var(--color-on-surface)]">{t('common:brand')}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">{currentUser?.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              {currentUser?.role ? t(`common:roles.${currentUser.role}`) : ''}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 p-3">
          <NavLink to="/owner/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.dashboard')}</NavLink>
          <NavLink to="/owner/kitchen" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.kitchen')}</NavLink>
          {canManageTables(userRole) ? (
            <NavLink to="/owner/tables" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.tables')}</NavLink>
          ) : null}
          {canManageMenu(userRole) ? (
            <NavLink to="/owner/menu" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.menu')}</NavLink>
          ) : null}
          <NavLink to="/owner/bills" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.bills')}</NavLink>
          <NavLink to="/owner/audit" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.auditLogs')}</NavLink>
          {canViewStaff ? (
            <NavLink to="/owner/staff" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.staff')}</NavLink>
          ) : null}
          <NavLink to="/owner/reports" className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-on-surface)]">{t('common:nav.reports')}</NavLink>
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full rounded-lg border border-[var(--color-outline-variant)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)]"
          >
            {t('auth:actions.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
