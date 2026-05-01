import { useTranslation } from 'react-i18next'

export default function LoadingSpinner() {
  const { t } = useTranslation('common')
  return <div>{t('loading')}</div>
}
