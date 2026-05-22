import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'

import { getActividad } from '../services/activityService'
import type { LogActividadResponse } from '../services/activityService'

import Navbar               from '../components/common/Navbar'
import Card                 from '../components/common/Card'
import SearchInput          from '../components/common/SearchInput/SearchInput'
import ActivityTable, { type ActivityRow } from '../components/features/admins/ActivityTable/ActivityTable'
import Pagination           from '../components/common/Pagination/Pagination'
import GenerateReportButton from '../components/features/reports/GenerateReportButton/GenerateReportButton'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',   label: 'Inicio',   path: '/admin'          },
  { key: 'usuarios', label: 'Usuarios', path: '/admin/usuarios' },
  { key: 'datos',    label: 'Datos',    path: '/admin/datos'    },
]

// ── Mapper ────────────────────────────────────────────────────────────────────

const toActivityRow = (log: LogActividadResponse): ActivityRow => ({
  id:        log.id,
  admin:     log.adminNombre ?? '—',
  accion:    log.accion,
  detalle:   log.detalle ?? '',
  timestamp: log.fecha.replace('T', ' ').slice(0, 16),
})

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const PAGE_SIZE = 10

  const [search,   setSearch]   = useState('')
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [page,     setPage]     = useState(1)

  useEffect(() => {
    getActividad()
      .then(list => setActivity(list.map(toActivityRow)))
      .catch(err => console.error('Error al cargar actividad', err))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const filtered = activity.filter(row =>
    search === '' ||
    row.admin.toLowerCase().includes(search.toLowerCase())  ||
    row.accion.toLowerCase().includes(search.toLowerCase()) ||
    row.detalle.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
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
            onChange={handleSearch}
            placeholder="Buscar actividad…"
            className="mb-4"
          />

          <ActivityTable data={paginated} />

          <div className="flex items-center justify-between mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onChange={setPage}
            />
            <GenerateReportButton />
          </div>
        </Card>

      </main>
    </div>
  )
}
