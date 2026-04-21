import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { logout } from '../../../services/authService'

const INACTIVITY_LIMIT = 12 * 60 * 60 * 1000 // 12 horas en ms
const EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']

export default function PrivateRoute() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) return

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(async () => {
        await logout()
        setUser(null)
        navigate('/login', {
          replace: true,
          state: { message: 'Tu sesión expiró por inactividad. Inicia sesión de nuevo.' },
        })
      }, INACTIVITY_LIMIT)
    }

    // Arranca el timer y lo reinicia en cada evento de actividad
    resetTimer()
    EVENTS.forEach(event => window.addEventListener(event, resetTimer))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      EVENTS.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [user, navigate, setUser])

  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}