import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getDefaultRouteForRole, isAdminRole } from '../../../utils/roleRoutes'

export default function AdminRoute() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (!isAdminRole(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />
  }

  return <Outlet />
}
