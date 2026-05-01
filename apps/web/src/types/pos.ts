export type TableStatus = 'Available' | 'Occupied' | 'NeedsPayment' | 'Closed'
export type OrderStatus = 'Pending' | 'SentToKitchen' | 'Paid' | 'Cancelled' | 'Voided'
export type OrderItemStatus = 'Pending' | 'SentToKitchen' | 'Cancelled' | 'Cooking' | 'Ready' | 'Served'
export type BillStatus = 'Paid' | 'Voided'
export type PaymentType = 'Cash' | 'Qr' | 'BankTransfer'

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

export interface BillItem {
  id: string
  orderItemId?: string
  itemNameSnapshot: string
  unitPriceSnapshot: number
  quantity: number
  lineTotal: number
}

export interface BillPreview {
  orderId: string
  tableId: string
  tableName: string
  orderStatus: OrderStatus
  totalAmount: number
  items: BillItem[]
}

export interface BillSummary {
  id: string
  billNumber: string
  orderId: string
  tableName: string
  status: BillStatus
  paymentType: PaymentType
  totalAmount: number
  paidAt: string
}

export interface Bill extends BillSummary {
  tableId: string
  items: BillItem[]
  voidedAt?: string
  voidReason?: string
}

export interface AuditLog {
  id: string
  userId?: string
  userName?: string
  action: string
  entityType: string
  entityId: string
  reason?: string
  createdAt: string
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}
