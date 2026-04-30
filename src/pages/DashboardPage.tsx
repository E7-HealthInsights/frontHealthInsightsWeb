import { useNavigate } from 'react-router-dom'
import { useAuth }    from '../context/AuthContext'
import { useEffect } from 'react'
import { getDefaultRouteForRole } from '../utils/roleRoutes'


export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const route = getDefaultRouteForRole(user?.role)
    navigate(route, { replace: true })
  }, [user?.role])

  return null  // solo redirige, no renderiza nada
}