import Button from './Button'

export default function QuantityStepper({
  value,
  min = 1,
  decreaseLabel,
  increaseLabel,
  onChange,
}: {
  value: number
  min?: number
  decreaseLabel: string
  increaseLabel: string
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" aria-label={decreaseLabel} onClick={() => onChange(Math.max(min, value - 1))}>
        -
      </Button>
      <span className="min-w-10 rounded-[var(--radius-button)] border border-[var(--color-outline-variant)] bg-[var(--color-surface-low)] px-3 py-2 text-center text-sm font-bold">
        {value}
      </span>
      <Button size="sm" aria-label={increaseLabel} onClick={() => onChange(value + 1)}>
        +
      </Button>
    </div>
  )
}
