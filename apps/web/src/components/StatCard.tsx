export default function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: React.ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    neutral: 'border-[var(--color-border-subtle)]',
    info: 'border-[var(--color-info)]/30 bg-[var(--color-info-soft)]',
    success: 'border-[var(--color-success)]/30 bg-[var(--color-success-soft)]',
    warning: 'border-[var(--color-warning)]/30 bg-[var(--color-warning-soft)]',
    danger: 'border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)]',
  }

  return (
    <div className={`rounded-[var(--radius-card)] border bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-2 text-2xl font-extrabold leading-tight tabular-nums text-[var(--color-text)]">{value}</div>
    </div>
  )
}
