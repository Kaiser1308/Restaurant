import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '@/components/Input'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { useDailyRevenue } from '@/features/reports'
import { useLocaleFormat } from '@/utils/format'

export default function ReportsPage() {
  const { t } = useTranslation('reports')
  const { formatMoney } = useLocaleFormat()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const { data, isLoading } = useDailyRevenue(date)

  return (
    <div className="app-page space-y-4">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        actions={<Input label={t('filter.date')} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
      />

      {isLoading ? (
        <div className="soft-panel flex min-h-40 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('metrics.totalRevenue')} value={formatMoney(data?.totalRevenue ?? 0)} tone="success" />
          <StatCard label={t('metrics.paidBillCount')} value={data?.paidBillCount ?? 0} tone="info" />
          <StatCard label={t('metrics.voidedBillCount')} value={data?.voidedBillCount ?? 0} tone="warning" />
          <StatCard label={t('metrics.voidedAmount')} value={formatMoney(data?.voidedAmount ?? 0)} tone="danger" />
        </div>
      )}
    </div>
  )
}
