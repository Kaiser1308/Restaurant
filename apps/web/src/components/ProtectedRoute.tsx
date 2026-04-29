import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

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

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingCurrentUser } = useAuth()

  if (isLoadingCurrentUser) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
