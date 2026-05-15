export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex rounded-[var(--radius-card)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-low)] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`h-9 rounded-[var(--radius-button)] px-3 text-sm font-bold transition ${
            value === option.value
              ? 'bg-[var(--color-surface-white)] text-[var(--color-primary)] shadow-[var(--shadow-card)]'
              : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
