export default function Modal({ children, open }: { children: React.ReactNode; open: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(49,48,46,0.42)] p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-white)] p-5 shadow-[var(--shadow-deep)]">
        {children}
      </div>
    </div>
  )
}
