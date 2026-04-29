export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-outline-variant)]/70 bg-[var(--color-surface-white)] p-6 shadow-[0_16px_36px_-26px_rgba(24,29,24,0.45)] ${className}`}
    >
      {children}
    </div>
  )
}
