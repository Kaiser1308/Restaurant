import apiClient from '@/services/api'
import type { Category, MenuItem } from '@/types'

export const menuApi = {
  async getCategories() {
    const response = await apiClient.get<Category[]>('/api/categories')
    return response.data
  },
  async createCategory(payload: { name: string; sortOrder: number }) {
    const response = await apiClient.post<Category>('/api/categories', payload)
    return response.data
  },
  async updateCategory(id: string, payload: { name: string; sortOrder: number; isActive: boolean }) {
    const response = await apiClient.patch<Category>(`/api/categories/${id}`, payload)
    return response.data
  },
  async getMenuItems(params?: { categoryId?: string; search?: string }) {
    const response = await apiClient.get<MenuItem[]>('/api/menu-items', { params })
    return response.data
  },
  async createMenuItem(payload: {
    categoryId: string
    name: string
    price: number
    description?: string
    isAvailable: boolean
  }) {
    const response = await apiClient.post<MenuItem>('/api/menu-items', payload)
    return response.data
  },
  async updateMenuItem(id: string, payload: {
    categoryId: string
    name: string
    price: number
    description?: string
    isActive: boolean
  }) {
    const response = await apiClient.patch<MenuItem>(`/api/menu-items/${id}`, payload)
    return response.data
  },
  async updateAvailability(id: string, isAvailable: boolean) {
    const response = await apiClient.patch<MenuItem>(`/api/menu-items/${id}/availability`, { isAvailable })
    return response.data
  },
  async uploadMenuItemImage(id: string, image: File) {
    const formData = new FormData()
    formData.append('image', image)

    const response = await apiClient.post<MenuItem>(`/api/menu-items/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
  },
  async deleteMenuItemImage(id: string) {
    const response = await apiClient.delete<MenuItem>(`/api/menu-items/${id}/image`)
    return response.data
  },
}
