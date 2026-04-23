import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'

import Navbar               from '../components/common/Navbar'
import Card                 from '../components/common/Card'
import SearchInput          from '../components/common/SearchInput/SearchInput'
import ActivityTable, { type ActivityRow } from '../components/features/admins/ActivityTable/ActivityTable'
import GenerateReportButton from '../components/features/reports/GenerateReportButton/GenerateReportButton'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',   label: 'Inicio',   path: '/admin'          },
  { key: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
  { key: 'datos',    label: 'Datos',    path: '/admin/datos'    },
]

// ── Datos mock ────────────────────────────────────────────────────────────────

const MOCK_ACTIVITY: ActivityRow[] = [
  { id: 1, admin: 'María López',  accion: 'Usuario creado',    detalle: 'Alta de nuevo usuario operativo',  timestamp: '2026-04-22 09:14' },
  { id: 2, admin: 'Carlos Ruiz',  accion: 'Dataset editado',   detalle: 'Corrección de valores atípicos',   timestamp: '2026-04-22 10:02' },
  { id: 3, admin: 'María López',  accion: 'Usuario eliminado', detalle: 'Cuenta duplicada eliminada',       timestamp: '2026-04-21 16:45' },
  { id: 4, admin: 'Ana Martínez', accion: 'Dataset creado',    detalle: 'Carga inicial de datos 2026',      timestamp: '2026-04-21 14:30' },
  { id: 5, admin: 'Carlos Ruiz',  accion: 'Usuario editado',   detalle: 'Cambio de rol a supervisor',       timestamp: '2026-04-20 11:55' },
  { id: 6, admin: 'Ana Martínez', accion: 'Dataset eliminado', detalle: 'Dataset desactualizado removido',  timestamp: '2026-04-19 08:22' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const [search, setSearch] = useState('')

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const filtered = MOCK_ACTIVITY.filter(row =>
    search === '' ||
    row.admin.toLowerCase().includes(search.toLowerCase())   ||
    row.accion.toLowerCase().includes(search.toLowerCase())  ||
    row.detalle.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">

      <Navbar
        links={NAV_LINKS}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
            Bienvenido, {user?.name}
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            {user?.role} · {user?.email}
          </p>
        </div>

        {/* Actividad reciente */}
        <Card title="Actividad reciente">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar actividad…"
            className="mb-4"
          />

          <ActivityTable data={filtered} />

          <div className="flex justify-end mt-6">
            <GenerateReportButton />
          </div>
        </Card>

      </main>
    </div>
  )
}
