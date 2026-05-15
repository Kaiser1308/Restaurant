export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'flat' | 'muted'
  padding?: 'none' | 'sm' | 'md'
}) {
  const variants = {
    default: 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]',
    flat: 'border-[var(--color-border-subtle)] bg-[var(--color-surface)]',
    muted: 'border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]',
  }

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
  }

  return (
    <div
      className={`rounded-[var(--radius-card)] border ${variants[variant]} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
