import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { User } from '@/types'
import { getDefaultPathByRole } from '@/features/auth/utils/roleAccess'

export function ProtectedRoute() {
  const { isAuthenticated, isLoadingCurrentUser } = useAuth()

  if (isLoadingCurrentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoadingCurrentUser, currentUser } = useAuth()

  if (isLoadingCurrentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathByRole(currentUser?.role)} replace />
  }

  return <>{children}</>
}

export function RoleRoute({
  allowedRoles,
}: {
  allowedRoles: User['role'][]
}) {
  const { currentUser, isLoadingCurrentUser } = useAuth()

  if (isLoadingCurrentUser) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDefaultPathByRole(currentUser.role)} replace />
  }

  return <Outlet />
}
