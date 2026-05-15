interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label> : null}
      <textarea
        className={`
          min-h-24 w-full resize-y rounded-[var(--radius-button)] border bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]
          border-[var(--color-border-subtle)] placeholder:text-[var(--color-text-muted)]
          focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgba(11,111,189,0.18)] transition-all
          disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)]
          ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/25' : ''}
          ${className}
        `}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-[var(--color-danger)]">{error}</span> : null}
    </div>
  )
}
