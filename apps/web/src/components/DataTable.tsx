import EmptyState from './EmptyState'
import LoadingSpinner from './LoadingSpinner'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  emptyTitle,
  emptyDescription,
}: {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  getRowKey: (row: T) => string
  isLoading?: boolean
  emptyTitle: string
  emptyDescription?: string
}) {
  if (isLoading) {
    return (
      <div className="soft-panel flex min-h-40 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="soft-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-xs font-bold uppercase text-[var(--color-text-muted)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={`border-b border-[var(--color-border-subtle)] px-4 py-3 ${column.className ?? ''}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)] bg-[var(--color-surface)]">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="align-top hover:bg-[var(--color-surface-raised)]">
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
