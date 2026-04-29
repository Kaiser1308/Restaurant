import type { User } from '@/types'

const roleLevel: Record<User['role'], number> = {
  Owner: 4,
  Manager: 3,
  Cashier: 2,
  Waiter: 1,
}

export function hasRoleAtLeast(role: User['role'], minimumRole: User['role']) {
  return roleLevel[role] >= roleLevel[minimumRole]
}

export function getDefaultPathByRole(role?: User['role']) {
  switch (role) {
    case 'Waiter':
      return '/waiter'
    case 'Cashier':
      return '/cashier'
    case 'Owner':
    case 'Manager':
      return '/owner'
    default:
      return '/login'
  }
}

export function canVoidBill(role: User['role']) {
  return hasRoleAtLeast(role, 'Cashier')
}

export function canManageMenu(role: User['role']) {
  return hasRoleAtLeast(role, 'Manager')
}

export function canManageTables(role: User['role']) {
  return hasRoleAtLeast(role, 'Manager')
}
