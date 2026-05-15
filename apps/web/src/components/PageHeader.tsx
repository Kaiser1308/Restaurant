export default function PageHeader({
  title,
  subtitle,
  meta,
  actions,
}: {
  title: string
  subtitle?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div className="min-w-0 flex-1">
        <h1 className="page-title min-w-0 break-words">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
        {meta}
        {actions}
      </div>
    </div>
  )
}
