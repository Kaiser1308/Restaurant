import apiClient from '@/services/api'
import type { LoginRequest, LoginResponse, RefreshTokenResponse } from '@/types'

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/api/auth/refresh', {
      refreshToken,
    })
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout')
  },

  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await apiClient.get<LoginResponse['user']>('/api/auth/me')
    return response.data
  },
}
