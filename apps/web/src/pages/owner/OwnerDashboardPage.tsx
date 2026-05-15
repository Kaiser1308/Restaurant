import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { useTables } from '@/features/tables'
import { useCategories, useMenuItems } from '@/features/menu'

export default function OwnerDashboardPage() {
  const { data: tables = [] } = useTables()
  const { data: categories = [] } = useCategories()
  const { data: menuItems = [] } = useMenuItems()
  const { t } = useTranslation(['common', 'tables', 'menu'])

  const activeTables = tables.filter((table) => table.status === 'Occupied' || table.status === 'NeedsPayment').length
  const unavailableItems = menuItems.filter((item) => !item.isAvailable).length

  return (
    <div className="app-page space-y-4">
      <PageHeader title={t('common:nav.dashboard')} subtitle={t('common:dashboard.subtitle')} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('tables:title')} value={tables.length} tone="info" />
        <StatCard label={t('common:dashboard.activeTables')} value={activeTables} tone="warning" />
        <StatCard label={t('menu:category.title')} value={categories.length} tone="neutral" />
        <StatCard label={t('common:dashboard.unavailableItems')} value={unavailableItems} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-lg font-extrabold">{t('tables:management')}</p>
            <Link to="/owner/tables">
              <Button variant="secondary">{t('common:actions.manage')}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tables.slice(0, 6).map((table) => (
              <div key={table.id} className="rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-3">
                <p className="mb-2 font-bold">{table.name}</p>
                <StatusBadge status={table.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <p className="text-lg font-extrabold">{t('common:dashboard.quickActions')}</p>
            <Link to="/owner/menu" className="block">
              <Button className="w-full" variant="secondary">{t('menu:management')}</Button>
            </Link>
            <Link to="/owner/audit" className="block">
              <Button className="w-full" variant="secondary">{t('common:nav.auditLogs')}</Button>
            </Link>
            <Link to="/owner/reports" className="block">
              <Button className="w-full" variant="secondary">{t('common:nav.reports')}</Button>
            </Link>
            <Link to="/owner/print-jobs" className="block">
              <Button className="w-full" variant="secondary">{t('common:nav.printJobs')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
