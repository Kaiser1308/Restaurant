import { useMutation, useQuery } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  })

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!localStorage.getItem('accessToken'),
  })

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    currentUser: currentUserQuery.data,
    isLoadingCurrentUser: currentUserQuery.isLoading,
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isAuthenticated: !!localStorage.getItem('accessToken'),
  }
}
