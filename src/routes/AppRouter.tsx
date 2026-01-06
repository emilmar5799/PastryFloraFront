import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login'
import NotFound from '../pages/NotFound'
import { useAuth } from '../hooks/useAuth'

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
