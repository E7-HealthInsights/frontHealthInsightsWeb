import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'
import Navbar          from '../components/common/Navbar'
import StatCard from '../components/features/dashboard/CardElements/StatCard/StatCard'
import GenerateReportButton from '../components/features/reports/GenerateReportButton/GenerateReportButton'

// ─── Nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]


export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const handleLogout = async () => {
    await logout()          // signOut(firebase) + localStorage.removeItem
    setUser(null)           // limpia el contexto
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">

      <Navbar
        links={NAV_LINKS}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Saludo */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
              Bienvenido, {user?.name}
            </h1>
            <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
              {user?.role} · {user?.email}
            </p>
          </div>

          <GenerateReportButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          
          <StatCard
            label="Gasto Total" value="$1.2B" subtitle="Presupuesto total" title='Gasto Total diabetes 2025'
          />
          <StatCard
            label="Gasto en Diabetes" value="$320M" subtitle="35% del presupuesto" title='Gasto en Diabetes 2025'
          />
          <StatCard
            label="Desviación" value="+8.5%" subtitle="Por encima del presupuesto" title='Desviación 2025'
          />
          <StatCard
            label="Proyecciones" value="3" subtitle="Escenarios activos" title='Proyecciones 2025'
          />
          <StatCard
            label="Reportes" value="5" subtitle="Generados este mes" title='Reportes 2025'
          />
        </div>

      </main>
    </div>
  )
}