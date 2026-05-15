import { Navigate } from 'react-router-dom'
import { getDefaultPathByRole, useAuth } from '@/features/auth'

export default function HomeRedirect() {
  const { currentUser } = useAuth()

  return <Navigate to={getDefaultPathByRole(currentUser?.role)} replace />
}
