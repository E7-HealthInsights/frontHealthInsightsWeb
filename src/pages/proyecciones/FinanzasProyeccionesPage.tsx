import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useAuth }        from '../../context/AuthContext'
import { logout }         from '../../services/authService'
import { deleteProyeccion, getProyecciones, saveProyeccion } from '../../services/proyeccionService'
import type { Proyeccion, ProyeccionResultado } from '../../types/Proyeccion'
import Navbar from '../../components/common/Navbar'
import ProyeccionDetalle from '../../components/features/projections/ProyeccionDetalle'
import ProjectionCard from '../../components/features/projections/ProjectionCard'
import FinanzasProyeccionModal from '../../components/features/projections/FinanzasProyeccionModal'


const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

type View = 'list' | 'detail'

export default function FinanzasProyeccionesPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const queryClient       = useQueryClient()

  const [view,     setView]     = useState<View>('list')
  const [selected, setSelected] = useState<Proyeccion | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // ── Data ──────────────────────────────────────────────────────────────────

  const { data: proyecciones = [], isLoading, isError } = useQuery({
    queryKey: ['proyecciones'],
    queryFn:  getProyecciones,
  })

  const saveMutation = useMutation({
    mutationFn: ({ titulo, descripcion, resultado }: { titulo: string; descripcion: string, resultado: ProyeccionResultado }) =>
      saveProyeccion(titulo, descripcion, resultado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyecciones'] })
      setModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProyeccion,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['proyecciones'] }),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout(); setUser(null)
    navigate('/login', { replace: true })
  }

  const handleVer = (p: Proyeccion) => { setSelected(p); setView('detail') }
  const handleVolver = ()            => { setSelected(null); setView('list') }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--color-hi-bg)]">

      <Navbar
        links={NAV_LINKS}
        activePath={window.location.pathname}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Vista detalle */}
        {view === 'detail' && selected && (
          <ProyeccionDetalle proyeccion={selected} onVolver={handleVolver} />
        )}

        {/* Vista lista */}
        {view === 'list' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
                Mis Escenarios
              </h1>
              <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
                Gestiona y compara tus proyecciones de salud · {user?.name}
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-center py-20">
                <svg className="animate-spin w-8 h-8 text-[var(--color-hi-primary)]"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/>
                  <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
              </div>
            )}

            {/* Error */}
            {isError && (
              <p className="text-sm text-[var(--color-hi-danger)] text-center py-20">
                No se pudieron cargar los escenarios.
              </p>
            )}

            {/* Grid */}
            {!isLoading && !isError && proyecciones.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {proyecciones.map(p => (
                  <ProjectionCard
                    key={p.id}
                    proyeccion={p}
                    onVer={handleVer}
                    onDelete={id => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isError && proyecciones.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-4 py-24
                border border-dashed border-[var(--color-hi-border)]
                rounded-[var(--radius-lg)] bg-[var(--color-hi-surface)]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-hi-text-hint)" strokeWidth={1.5} strokeLinecap="round">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-[var(--color-hi-text-main)]">
                    Aún no tienes escenarios guardados
                  </p>
                  <p className="text-xs text-[var(--color-hi-text-hint)] mt-1">
                    Crea tu primera proyección con el botón +
                  </p>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* FAB */}
      {view === 'list' && (
        <button
          onClick={() => setModalOpen(true)}
          aria-label="Nueva proyección"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full
            bg-[var(--color-hi-primary)] text-white shadow-lg
            hover:bg-[var(--color-hi-primary-dark)] transition-colors
            flex items-center justify-center cursor-pointer z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5"  y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      {/* Modal específico de Finanzas */}
      <FinanzasProyeccionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        saving={saveMutation.isPending}
        onSave={(titulo, descripcion, resultado) => saveMutation.mutateAsync({ titulo, descripcion, resultado })}
      />

    </div>
  )
}