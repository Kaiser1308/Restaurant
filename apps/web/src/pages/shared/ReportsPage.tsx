import { useTranslation } from 'react-i18next'
import Card from '@/components/Card'

export default function ReportsPage() {
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
