import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'
import { useAuth } from './features/auth/hooks/useAuth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

function AppContent() {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold">Login (TODO)</h1>
            </div>
          </PublicRoute>
        }
      />
      <Route
        element={<ProtectedRoute />}
      >
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold">
                Restaurant POS - {currentUser?.role || 'Guest'}
              </h1>
            </div>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
