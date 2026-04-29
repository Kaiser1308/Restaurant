import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!localStorage.getItem('accessToken'),
  })
}
