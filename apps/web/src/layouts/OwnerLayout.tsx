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
    <div className="flex min-h-screen bg-[var(--color-surface-low)] pb-16 md:pb-0">
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
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/owner/dashboard" className="nav-link">{t('common:nav.dashboard')}</NavLink>
          <NavLink to="/owner/kitchen" className="nav-link">{t('common:nav.kitchen')}</NavLink>
          {canManageTables(userRole) ? (
            <NavLink to="/owner/tables" className="nav-link">{t('common:nav.tables')}</NavLink>
          ) : null}
          {canManageMenu(userRole) ? (
            <NavLink to="/owner/menu" className="nav-link">{t('common:nav.menu')}</NavLink>
          ) : null}
          <NavLink to="/owner/bills" className="nav-link">{t('common:nav.bills')}</NavLink>
          <NavLink to="/owner/audit" className="nav-link">{t('common:nav.auditLogs')}</NavLink>
          <NavLink to="/owner/print-jobs" className="nav-link">{t('common:nav.printJobs')}</NavLink>
          {canViewStaff ? (
            <NavLink to="/owner/staff" className="nav-link">{t('common:nav.staff')}</NavLink>
          ) : null}
          <NavLink to="/owner/reports" className="nav-link">{t('common:nav.reports')}</NavLink>
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            disabled={isLogoutLoading}
            className="w-full rounded-[var(--radius-button)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-low)]"
          >
            {t('auth:actions.logout')}
          </button>
        </div>
      </aside>
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] px-4 py-3 shadow-[var(--shadow-card)] md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold">{t('common:brand')}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{currentUser?.name}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 p-4 pt-20 md:p-6">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 overflow-x-auto border-t border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] shadow-[var(--shadow-deep)] md:hidden">
        <div className="flex min-w-max gap-1 px-2 py-2">
          <NavLink to="/owner/dashboard" className="nav-link text-center">{t('common:nav.dashboard')}</NavLink>
          <NavLink to="/owner/tables" className="nav-link text-center">{t('common:nav.tables')}</NavLink>
          <NavLink to="/owner/menu" className="nav-link text-center">{t('common:nav.menu')}</NavLink>
          <NavLink to="/owner/bills" className="nav-link text-center">{t('common:nav.bills')}</NavLink>
          <NavLink to="/owner/audit" className="nav-link text-center">{t('common:nav.auditLogs')}</NavLink>
          <NavLink to="/owner/print-jobs" className="nav-link text-center">{t('common:nav.printJobs')}</NavLink>
        </div>
      </nav>
    </div>
  )
}
