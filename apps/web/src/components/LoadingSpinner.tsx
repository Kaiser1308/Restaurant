import { useTranslation } from 'react-i18next'

export default function LoadingSpinner() {
  const { t } = useTranslation('common')
  return (
    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-on-surface-variant)]">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-outline-variant)] border-t-[var(--color-primary)]" />
      {t('loading')}
    </div>
  )
}
