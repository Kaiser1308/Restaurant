export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-1 py-8 text-center">
      <p className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{title}</p>
      {description ? (
        <p className="text-xs text-[var(--color-on-surface-variant)]">{description}</p>
      ) : null}
    </div>
  )
}
