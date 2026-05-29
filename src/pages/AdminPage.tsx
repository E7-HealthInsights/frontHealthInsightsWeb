import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'
import { logout }      from '../services/authService'

import { getActividad } from '../services/activityService'
import type { LogActividadResponse } from '../services/activityService'

import { debounce } from 'lodash'
import { createReporte } from '../services/reportService'
import { useGenerarPDF } from '../hooks/useGenerarPDF'

import Navbar               from '../components/common/Navbar'
import Card                 from '../components/common/Card'
import SearchInput          from '../components/common/SearchInput/SearchInput'
import ActivityTable, { type ActivityRow } from '../components/features/admins/ActivityTable/ActivityTable'
import Pagination           from '../components/common/Pagination/Pagination'
import GenerateReportButton from '../components/features/reports/GenerateReportButton/GenerateReportButton'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',    label: 'Inicio',    path: '/admin'          },
  { key: 'usuarios',  label: 'Usuarios',  path: '/admin/usuarios' },
  { key: 'datos',     label: 'Datos',     path: '/admin/datos'    },
  { key: 'reportes',  label: 'Reportes',  path: '/admin/reportes' },
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

  const reporteRef             = useRef<HTMLDivElement>(null)
  const { generar, generando } = useGenerarPDF()

  const [search,       setSearch]       = useState('')
  const [activity,     setActivity]     = useState<ActivityRow[]>([])
  const [page,         setPage]         = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const fetchActividad = useCallback((p: number, s: string) => {
    getActividad(p, PAGE_SIZE, s)
      .then(res => {
        setActivity(res.data.map(toActivityRow))
        setTotalPaginas(res.totalPaginas)
      })
      .catch(err => console.error('Error al cargar actividad', err))
  }, [])

  useEffect(() => { fetchActividad(page, search) }, [page])

  const debouncedSearch = useMemo(
    () => debounce((value: string) => { setPage(1); fetchActividad(1, value) }, 400),
    [fetchActividad]
  )

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const filtered = activity

  const handleSearch = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  const handleGenerarReporte = async () => {
    if (!reporteRef.current) return
    const mes    = new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })
    const titulo = `Bitácora de Actividad — ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
    await generar(reporteRef.current, titulo)
    createReporte({ titulo, tipo: 'ACTIVIDAD' }).catch(() => {/* no bloquear si el back no está listo */})
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

          <ActivityTable data={activity} />

          <div className="flex items-center justify-between mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPaginas}
              onChange={setPage}
            />
            <GenerateReportButton
              onClick={handleGenerarReporte}
              loading={generando}
            />
          </div>
        </Card>

      </main>

      {/* Contenido del PDF — fuera de pantalla, usa Tailwind + ActivityTable */}
      <div
        ref={reporteRef}
        aria-hidden="true"
        className="fixed top-0 bg-white p-8"
        style={{ left: '-9999px', width: '1100px' }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--color-hi-navy)]">
            Bitácora de Actividad
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-1">
            Generado por: {user?.name} {user?.lastName} &nbsp;·&nbsp; {new Date().toLocaleDateString('es-MX')}
          </p>
        </div>

        <ActivityTable data={filtered} wrap />
      </div>

    </div>
  )
}
