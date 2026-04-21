import { useState } from 'react'
import LoginCard from '../components/features/auth/LoginCard'
import { login } from '../services/authService'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const location = useLocation()
  const sessionMessage = (location.state as { message?: string })?.message ?? ''
  const navigate = useNavigate()
  const { setUser } = useAuth()

const handleSubmit = async (email: string, password: string) => {
  setError('')
  setLoading(true)
  try {
    const user = await login(email, password)
    setUser(user)
    navigate('/', { replace: true })
    // navigate('/dashboard')  ← cuando haya dashboard
  } catch (err: unknown) {
    if (err instanceof Error) {
      // Firebase lanza códigos específicos, los mapeamos a mensajes amigables
      const msg = err.message
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setError('Correo o contraseña incorrectos. Intenta de nuevo.')
      } else {
        setError(msg)
      }
    } else {
      setError('Ocurrió un error inesperado.')
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo: branding (oculto en móvil) ─────────────────── */}
      <aside
        className="hidden lg:flex w-[480px] shrink-0 flex-col justify-between
          bg-[var(--color-hi-navy)] text-white p-12"
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-hi-primary)]
              flex items-center justify-center shrink-0"
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">HealthInsights</span>
        </div>

        {/* Contenido central */}
        <div>
          <h1 className="text-3xl font-bold leading-snug mb-4">
            Análisis estratégico<br />de la diabetes en México
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Transforma estadísticas oficiales en herramientas reales de toma de
            decisiones para directores, instituciones y organismos de salud pública.
          </p>

          <ul className="flex flex-col gap-3">
            {[
              'Datos epidemiológicos y financieros integrados',
              'Simulación de escenarios de intervención',
              'Proyecciones por región, edad y nivel socioeconómico',
            ].map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="var(--color-hi-primary)" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 mt-0.5" aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Pie del panel */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          © 2026 HealthInsights · Equipo 7 · TC3004B
        </p>
      </aside>

      {/* ── Panel derecho: formulario ───────────────────────────────────── */}
      <main
        className="flex-1 flex flex-col items-center justify-center
          bg-[var(--color-hi-bg)] p-8"
      >
        {/* Logo compacto visible solo en móvil */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div
            className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-hi-primary)]
              flex items-center justify-center"
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="text-base font-semibold text-[var(--color-hi-navy)]">
            HealthInsights
          </span>
        </div>

        {sessionMessage && (
          <div className="mb-4 w-full max-w-sm rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            {sessionMessage}
          </div>
        )}

        <LoginCard
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
        />
      </main>

    </div>
  )
}
