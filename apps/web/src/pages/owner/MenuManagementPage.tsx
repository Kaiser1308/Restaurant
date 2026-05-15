import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/components/Button'
import Card from '@/components/Card'
import DataTable, { type DataTableColumn } from '@/components/DataTable'
import FileUpload from '@/components/FileUpload'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import Select from '@/components/Select'
import StatusBadge from '@/components/StatusBadge'
import Textarea from '@/components/Textarea'
import Toast from '@/components/Toast'
import { menuApi, useCategories, useMenuItems } from '@/features/menu'
import { useLocaleFormat } from '@/utils/format'
import type { Category, MenuItem } from '@/types'

export default function MenuManagementPage() {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['menu', 'common'])
  const { formatMoney } = useLocaleFormat()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
  const { data: menuItems = [], isLoading: isMenuLoading } = useMenuItems()
  const [categoryName, setCategoryName] = useState('')
  const [categorySort, setCategorySort] = useState('1')
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('50000')
  const [itemDescription, setItemDescription] = useState('')
  const [itemCategoryId, setItemCategoryId] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [toast, setToast] = useState<{ variant: 'error' | 'warning' | 'success'; message: string } | null>(null)

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories]
  )

  const refreshMenu = async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] })
    await queryClient.invalidateQueries({ queryKey: ['menuItems'] })
  }

  const createCategory = useMutation({
    mutationFn: () => menuApi.createCategory({ name: categoryName.trim(), sortOrder: Number(categorySort) || 1 }),
    onSuccess: async () => {
      setCategoryName('')
      setCategorySort('1')
      await refreshMenu()
    },
    onError: () => setToast({ variant: 'error', message: t('errors.createCategoryFailed') }),
  })

  const createMenuItem = useMutation({
    mutationFn: async () => {
      const saved = await menuApi.createMenuItem({
        categoryId: itemCategoryId || categories[0]?.id || '',
        name: itemName.trim(),
        price: Number(itemPrice),
        description: itemDescription.trim() || undefined,
        isAvailable: true,
      })

      if (selectedImage) {
        await menuApi.uploadMenuItemImage(saved.id, selectedImage)
      }

      return saved
    },
    onSuccess: async () => {
      setItemName('')
      setItemPrice('50000')
      setItemDescription('')
      setSelectedImage(null)
      await refreshMenu()
    },
    onError: () => setToast({ variant: 'error', message: t('errors.createMenuItemFailed') }),
  })

  const updateAvailability = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) => menuApi.updateAvailability(id, isAvailable),
    onSuccess: refreshMenu,
    onError: () => setToast({ variant: 'error', message: t('errors.updateAvailabilityFailed') }),
  })

  const deleteImage = useMutation({
    mutationFn: (id: string) => menuApi.deleteMenuItemImage(id),
    onSuccess: refreshMenu,
    onError: () => setToast({ variant: 'error', message: t('errors.deleteImageFailed') }),
  })

  const categoryColumns: Array<DataTableColumn<Category>> = [
    { key: 'name', header: t('menu:category.title'), render: (category) => <span className="font-bold">{category.name}</span> },
    { key: 'sort', header: t('menu:category.sortOrder'), render: (category) => category.sortOrder },
    { key: 'status', header: t('common:labels.status'), render: (category) => <StatusBadge status={category.isActive ? 'Available' : 'Closed'} /> },
  ]

  const menuColumns: Array<DataTableColumn<MenuItem>> = [
    {
      key: 'item',
      header: t('menu:menuItem.title'),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-low)]">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <p className="font-bold">{item.name}</p>
            <p className="text-xs text-[var(--color-on-surface-variant)]">{item.description || t('menu:menuItem.noDescription')}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('menu:category.title'),
      render: (item) => categories.find((category) => category.id === item.categoryId)?.name ?? '-',
    },
    { key: 'price', header: t('common:labels.price'), render: (item) => <span className="font-bold">{formatMoney(item.price)}</span> },
    {
      key: 'availability',
      header: t('menu:menuItem.availability'),
      render: (item) => <StatusBadge status={item.isAvailable ? 'Available' : 'Closed'} />,
    },
    {
      key: 'actions',
      header: t('common:actions.edit'),
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={updateAvailability.isPending} onClick={() => updateAvailability.mutate({ id: item.id, isAvailable: !item.isAvailable })}>
            {item.isAvailable ? t('menu:menuItem.markUnavailable') : t('menu:menuItem.markAvailable')}
          </Button>
          {item.imageUrl ? (
            <Button size="sm" variant="ghost" disabled={deleteImage.isPending} onClick={() => deleteImage.mutate(item.id)}>
              {t('menu:menuItem.deleteImage')}
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="app-page space-y-4">
      <PageHeader title={t('menu:management')} subtitle={t('menu:managementPage.subtitle')} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="space-y-3">
            <p className="text-lg font-extrabold">{t('menu:category.create')}</p>
            <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={t('menu:category.createPlaceholder')} />
            <Input value={categorySort} onChange={(e) => setCategorySort(e.target.value)} placeholder={t('menu:category.sortOrder')} />
            <Button disabled={!categoryName.trim() || createCategory.isPending} onClick={() => createCategory.mutate()}>
              {t('menu:category.create')}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder={t('menu:menuItem.createPlaceholder')} />
            <Input value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder={t('common:labels.price')} />
            <Select
              value={itemCategoryId || categories[0]?.id || ''}
              onChange={(e) => setItemCategoryId(e.target.value)}
              options={categoryOptions}
              label={t('menu:category.title')}
            />
            <FileUpload
              label={t('menu:menuItem.image')}
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
            />
            <Textarea
              className="lg:col-span-2"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder={t('common:labels.description')}
            />
            <Button
              className="lg:col-span-2"
              disabled={!itemName.trim() || !Number(itemPrice) || categories.length === 0 || createMenuItem.isPending}
              onClick={() => createMenuItem.mutate()}
            >
              {t('menu:menuItem.create')}
            </Button>
          </div>
        </Card>
      </div>

      <DataTable
        columns={categoryColumns}
        rows={categories}
        getRowKey={(category) => category.id}
        isLoading={isCategoriesLoading}
        emptyTitle={t('menu:category.emptyTitle')}
      />

      <DataTable
        columns={menuColumns}
        rows={menuItems}
        getRowKey={(item) => item.id}
        isLoading={isMenuLoading}
        emptyTitle={t('menu:menuItem.emptyTitle')}
      />
      {toast ? <Toast variant={toast.variant} message={toast.message} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
