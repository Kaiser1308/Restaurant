import { useTranslation } from 'react-i18next'

const statusKeyMap: Record<string, string> = {
  available: 'common:status.available',
  occupied: 'common:status.occupied',
  needspayment: 'common:status.needsPayment',
  reserved: 'common:status.reserved',
  closed: 'common:status.closed',
  pending: 'common:status.pending',
  senttokitchen: 'common:status.sentToKitchen',
  cooking: 'orders:status.cooking',
  confirmed: 'common:status.completed',
  ready: 'common:status.completed',
  paid: 'common:status.paid',
  voided: 'common:status.voided',
  cancelled: 'common:status.cancelled',
  printing: 'common:status.processing',
  printed: 'common:status.completed',
  failed: 'common:status.failed',
}

export default function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const normalized = status.trim().toLowerCase()
  const palette: Record<string, string> = {
    available: 'bg-[var(--color-surface-muted)] text-[var(--color-text)] border-[var(--color-border-subtle)]',
    occupied: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30',
    needspayment: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/30',
    reserved: 'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/30',
    closed: 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
    attention: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
    paid: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/30',
    voided: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
    cancelled: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
    pending: 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
    senttokitchen: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/30',
    printing: 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/30',
    printed: 'bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/30',
    failed: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/30',
  }

  const style = palette[normalized] ?? 'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'
  const translationKey = statusKeyMap[normalized]

  return (
    <span className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold ${style}`}>
      {translationKey ? t(translationKey) : status}
    </span>
  )
}
