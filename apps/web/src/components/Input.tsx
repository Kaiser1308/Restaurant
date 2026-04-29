interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[var(--color-on-surface)]">
          {label}
        </label>
      )}
      <input
        className={`
          h-11 w-full rounded-[var(--radius-button)] border bg-[var(--color-surface-white)] px-4 text-sm text-[var(--color-on-surface)]
          border-[var(--color-outline-variant)] placeholder:text-[var(--color-on-surface-variant)]/65
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] transition-all
          ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/25' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs font-medium text-[var(--color-error)]">{error}</span>}
    </div>
  )
}
