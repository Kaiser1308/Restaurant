import { useTranslation } from 'react-i18next'
import Card from '@/components/Card'

export default function ComingSoonPage({ navKey }: { navKey: 'nav.tables' | 'nav.menu' | 'nav.staff' }) {
  const { t } = useTranslation('common')
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{t(navKey)}</h2>
      <Card>
        <p className="text-sm text-[var(--color-on-surface-variant)]">{t('comingSoon')}</p>
      </Card>
    </div>
  )
}
