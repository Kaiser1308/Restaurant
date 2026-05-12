import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/Button'
import Card from '@/components/Card'
import DataTable, { type DataTableColumn } from '@/components/DataTable'
import FormActions from '@/components/FormActions'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import Select from '@/components/Select'
import StatusBadge from '@/components/StatusBadge'
import Toast from '@/components/Toast'
import { tablesApi, useTables } from '@/features/tables'
import type { RestaurantTable, TableStatus } from '@/types'

const TABLE_STATUSES: TableStatus[] = ['Available', 'Occupied', 'NeedsPayment', 'Closed']

export default function TablesManagementPage() {
  const queryClient = useQueryClient()
  const { data: tables = [], isLoading } = useTables()
  const { t } = useTranslation(['tables', 'common'])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editName, setEditName] = useState('')
  const [editStatus, setEditStatus] = useState<TableStatus>('Available')
  const [toast, setToast] = useState<{ variant: 'error' | 'warning' | 'success'; message: string } | null>(null)

  const createTable = useMutation({
    mutationFn: () => tablesApi.create(newName.trim()),
    onSuccess: async () => {
      setNewName('')
      await queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: () => setToast({ variant: 'error', message: t('tables:errors.createTableFailed') }),
  })

  const updateTable = useMutation({
    mutationFn: () => tablesApi.update(editingId, { name: editName.trim(), status: editStatus }),
    onSuccess: async () => {
      setEditingId('')
      await queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: () => setToast({ variant: 'error', message: t('tables:errors.updateTableFailed') }),
  })

  const startEdit = (table: RestaurantTable) => {
    setEditingId(table.id)
    setEditName(table.name)
    setEditStatus(table.status)
  }

  const columns: Array<DataTableColumn<RestaurantTable>> = [
    {
      key: 'name',
      header: t('tables:managementPage.columns.name'),
      render: (table) => (
        editingId === table.id ? (
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
        ) : (
          <span className="font-bold">{table.name}</span>
        )
      ),
    },
    {
      key: 'status',
      header: t('tables:managementPage.columns.status'),
      render: (table) => (
        editingId === table.id ? (
          <Select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as TableStatus)}
            options={TABLE_STATUSES.map((status) => ({
              value: status,
              label: t(`common:status.${status === 'NeedsPayment' ? 'needsPayment' : status.toLowerCase()}`),
            }))}
          />
        ) : (
          <StatusBadge status={table.status} />
        )
      ),
    },
    {
      key: 'actions',
      header: t('common:actions.edit'),
      className: 'w-48',
      render: (table) => (
        editingId === table.id ? (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditingId('')}>
              {t('common:actions.cancel')}
            </Button>
            <Button size="sm" disabled={!editName.trim() || updateTable.isPending} onClick={() => updateTable.mutate()}>
              {t('common:actions.save')}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => startEdit(table)}>
            {t('common:actions.edit')}
          </Button>
        )
      ),
    },
  ]

  return (
    <div className="app-page space-y-4">
      <PageHeader title={t('tables:management')} subtitle={t('tables:managementPage.subtitle')} />

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
          <Input
            label={t('tables:placeholder.tableName')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('tables:placeholder.tableName')}
          />
          <div className="flex items-end">
            <Button disabled={!newName.trim() || createTable.isPending} onClick={() => createTable.mutate()}>
              {t('common:actions.create')}
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        rows={tables}
        getRowKey={(table) => table.id}
        isLoading={isLoading}
        emptyTitle={t('tables:managementPage.emptyTitle')}
        emptyDescription={t('tables:managementPage.emptyDescription')}
      />

      <FormActions>
        <span className="text-sm font-semibold text-[var(--color-on-surface-variant)]">
          {t('tables:summary.total', { count: tables.length })}
        </span>
      </FormActions>

      {toast && <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  )
}
