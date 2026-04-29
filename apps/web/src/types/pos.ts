export type TableStatus = 'Available' | 'Occupied' | 'NeedsPayment' | 'Closed'
export type OrderStatus = 'Pending' | 'SentToKitchen' | 'Paid' | 'Cancelled' | 'Voided'
export type OrderItemStatus = 'Pending' | 'SentToKitchen' | 'Cancelled' | 'Cooking' | 'Ready' | 'Served'

export interface RestaurantTable {
  id: string
  name: string
  status: TableStatus
}

export interface Category {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  price: number
  description?: string
  isAvailable: boolean
  isActive: boolean
}

export interface OrderItem {
  id: string
  menuItemId: string
  itemNameSnapshot: string
  quantity: number
  unitPrice: number
  lineTotal: number
  status: OrderItemStatus
  cancelReason?: string
}

export interface OrderDetail {
  id: string
  tableId: string
  tableName: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  createdAt: string
}
