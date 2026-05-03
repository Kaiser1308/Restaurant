import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTables } from '@/features/tables'
import { useCategories } from '@/features/menu'
import { tablesApi } from '@/features/tables'
import { menuApi } from '@/features/menu'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Card from '@/components/Card'
import StatusBadge from '@/components/StatusBadge'

export default function OwnerDashboardPage() {
  const queryClient = useQueryClient()
  const { data: tables = [] } = useTables()
  const [tableName, setTableName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [menuName, setMenuName] = useState('')
  const [menuPrice, setMenuPrice] = useState('50000')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [menuFormError, setMenuFormError] = useState('')
  const { data: categories = [] } = useCategories()
  const { t } = useTranslation(['tables', 'menu', 'common'])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedImage(event.target.files?.[0] ?? null)
    setMenuFormError('')
  }

  const createTable = useMutation({
    mutationFn: () => tablesApi.create(tableName.trim()),
    onSuccess: () => {
      setTableName('')
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
  const createCategory = useMutation({
    mutationFn: () => menuApi.createCategory({ name: categoryName.trim(), sortOrder: 1 }),
    onSuccess: () => {
      setCategoryName('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
  const createMenuItem = useMutation({
    mutationFn: async () => {
      const savedItem = await menuApi.createMenuItem({
        categoryId: categories[0]?.id || '',
        name: menuName.trim(),
        price: Number(menuPrice),
        isAvailable: true,
      })

      if (selectedImage) {
        await menuApi.uploadMenuItemImage(savedItem.id, selectedImage)
      }

      return savedItem
    },
    onSuccess: () => {
      setMenuName('')
      setMenuPrice('50000')
      setSelectedImage(null)
      setMenuFormError('')
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    },
    onError: () => {
      setMenuFormError(t('menu:menuItem.imageUploadError'))
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-2 font-semibold">{t('tables:management')}</p>
        <div className="flex gap-2">
          <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder={t('tables:placeholder.tableName')} />
          <Button onClick={() => createTable.mutate()} disabled={!tableName.trim()}>{t('common:actions.create')}</Button>
        </div>
        <div className="mt-3 space-y-2">
          {tables.map(tbl => <p key={tbl.id}>{tbl.name} - <StatusBadge status={tbl.status} /></p>)}
        </div>
      </Card>
      <Card>
        <p className="mb-2 font-semibold">{t('menu:management')}</p>
        <div className="mb-2 flex gap-2">
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder={t('menu:category.createPlaceholder')} />
          <Button onClick={() => createCategory.mutate()} disabled={!categoryName.trim()}>{t('menu:category.create')}</Button>
        </div>
        <div className="flex gap-2">
          <Input value={menuName} onChange={(e) => setMenuName(e.target.value)} placeholder={t('menu:menuItem.createPlaceholder')} />
          <Input value={menuPrice} onChange={(e) => setMenuPrice(e.target.value)} placeholder={t('common:labels.price')} />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <Button onClick={() => createMenuItem.mutate()} disabled={!menuName.trim() || categories.length === 0}>{t('menu:menuItem.create')}</Button>
        </div>
        {menuFormError ? <p className="mt-2 text-sm text-red-600">{menuFormError}</p> : null}
      </Card>
    </div>
  )
}
