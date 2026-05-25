import { useEffect, useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { logout }              from '../services/authService'

import { getReportes, deleteReporte } from '../services/reportService'
import type { ReporteResponse }       from '../services/reportService'

import Navbar      from '../components/common/Navbar'
import ReportCard  from '../components/features/reports/ReportCard/ReportCard'

// ── Nav links ─────────────────────────────────────────────────────────────────

const USER_NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

const ADMIN_NAV_LINKS = [
  { key: 'inicio',   label: 'Inicio',   path: '/admin'          },
  { key: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
  { key: 'datos',    label: 'Datos',    path: '/admin/datos'    },
  { key: 'reportes', label: 'Reportes', path: '/admin/reportes' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const isAdmin           = user?.role === 'ADMINISTRADOR' || user?.role === 'ADMIN'
  const navLinks          = isAdmin ? ADMIN_NAV_LINKS : USER_NAV_LINKS

  const [reportes, setReportes] = useState<ReporteResponse[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    getReportes()
      .then(data => setReportes(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleDelete = async (id: string) => {
    await deleteReporte(id)
    setReportes(prev => prev.filter(r => r.id !== id))
  }

  const handleVer = (reporte: ReporteResponse) => {
    if (reporte.tipo === 'DASHBOARD')   navigate('/')
    if (reporte.tipo === 'ACTIVIDAD')   navigate('/admin')
    if (reporte.tipo === 'PROYECCION')  navigate('/proyecciones')
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">

      <Navbar
        links={navLinks}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
            Mis Reportes
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            {user?.name} · {user?.email}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-[var(--color-hi-primary)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-20">
            <p className="text-sm text-[var(--color-hi-danger)]">
              No se pudieron cargar los reportes. Intenta recargar la página.
            </p>
          </div>
        )}

        {!loading && !error && reportes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16
            rounded-[var(--radius-lg)] border border-dashed border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)]">
            <p className="text-sm text-[var(--color-hi-text-hint)]">
              No hay reportes generados aún.
            </p>
          </div>
        )}

        {!loading && !error && reportes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reportes.map(r => (
              <ReportCard
                key={r.id}
                id={r.id.slice(0, 8).toUpperCase()}
                title={r.titulo}
                date={formatFecha(r.fechaCreacion)}
                onView={() => handleVer(r)}
                onDownload={() => handleVer(r)}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
