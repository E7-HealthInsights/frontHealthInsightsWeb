import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { debounce } from 'lodash'

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
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading,     setLoading]     = useState(false)

  const fetchActividad = useCallback((p: number, s: string) => {
    setLoading(true)
    getActividad(p, PAGE_SIZE, s)
      .then(res => {
        setActivity(res.data.map(toActivityRow))
        setTotalPaginas(res.totalPaginas)
      })
      .catch(err => console.error('Error al cargar actividad', err))
      .finally(() => setLoading(false))
  }, [])

  // Carga inicial y cuando cambia página
  useEffect(() => {
    fetchActividad(page, search)
  }, [page])

  // Debounce para búsqueda — espera 400ms antes de llamar al back
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setPage(1)          // regresa a página 1 al buscar
      fetchActividad(1, value)
    }, 400),
    [fetchActividad]
  )

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

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

  const handleSearch = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handlePageChange = (newPage: number) => {  
    setPage(newPage)
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

          {loading
            ? <p className="text-sm text-[var(--color-hi-text-sub)] py-8 text-center">
                Cargando actividad…
              </p>
            : <ActivityTable data={activity} />
          }


          <div className="flex items-center justify-between mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPaginas}
              onChange={handlePageChange}
            />
            <GenerateReportButton />
          </div>
        </Card>

      </main>
    </div>
  )
}
