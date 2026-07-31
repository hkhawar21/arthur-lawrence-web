import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/store/auth-store'
import './ProtectedRoute.css'

export default function ProtectedRoute({ children }) {
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return (
      <div className="protected-route-loading">
        <p role="status">Loading…</p>
      </div>
    )
  }
  if (status === 'signedOut') return <Navigate to="/login" replace />

  return children
}
