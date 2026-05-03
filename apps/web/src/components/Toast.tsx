import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Toast({
  message,
  onClose,
  variant = 'error',
}: {
  message: string
  onClose: () => void
  variant?: 'error' | 'warning' | 'success'
}) {
  const { t } = useTranslation('common')
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timer)
  }, [onClose])

  const variantStyles = {
    error: 'border-[var(--color-error)] bg-[#fff0f0] text-[var(--color-error)]',
    warning: 'border-[var(--color-warning)] bg-[#fff8e5] text-[#8a6500]',
    success: 'border-[var(--color-success)] bg-[#edf8ef] text-[#1f6a2f]',
  }

  return (
    <div className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))]">
      <div className={`rounded-[var(--radius-card)] border px-4 py-3 shadow-sm ${variantStyles[variant]}`}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-1 text-sm font-semibold opacity-70 hover:opacity-100"
            aria-label={t('accessibility.closeNotification')}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
