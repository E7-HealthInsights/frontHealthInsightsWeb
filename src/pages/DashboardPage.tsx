import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { logout }              from '../services/authService'


import Navbar               from '../components/common/Navbar'
import StatCard             from '../components/features/dashboard/CardElements/StatCard/StatCard'
import ChartCard            from '../components/features/dashboard/CardElements/ChartCard/ChartCard'
import FAB                  from '../components/features/dashboard/FAB/FAB'
import GenerateElementModal from '../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import type { ElementType, GeneratePayload } from '../types/Widget'
import { deleteWidget, getMyWidgets, type ChartData, type StatData, type Widget } from '../services/widgetService'

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

function isStatData(data: Widget['data']): data is StatData {
  return !Array.isArray(data) && typeof data === 'object' && 'value' in data
}

const chartTypeMap: Record<string, 'bar' | 'line' | 'pie'> = {
  bar: 'bar', line: 'line', pie: 'pie', tabla: 'bar',
}

function WidgetRenderer({ widget, onDelete }: { widget: Widget; onDelete: () => void }) {
  const actions = widget.isDefault
    ? []
    : [{ label: 'Eliminar', onClick: onDelete, danger: true as const }]

  if (widget.tipo === 'stat' && isStatData(widget.data)) {
    return (
      <StatCard
        title={widget.title}
        subtitle={widget.subtitle ?? ''}
        value={String(widget.data.value)}
        label={widget.data.unit ?? ''}
      />
    )
  }

  const chartData = widget.data as ChartData
  const keys      = chartData.length > 0 ? Object.keys(chartData[0]) : ['x', 'y']

  return (
    <ChartCard
      title={widget.title}
      subtitle={widget.subtitle}
      tipo={chartTypeMap[widget.tipo] ?? 'bar'}
      data={chartData}
      xKey={keys[0]}
      series={[{ dataKey: keys[1] ?? 'y', name: keys[1] ?? 'valor' }]}
      actions={actions}
    />
  )
}


export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const [widgets,  setWidgets]  = useState<Widget[]>([])
  const [fetching, setFetching] = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [elementType, setElementType] = useState<ElementType>('grafica')

  useEffect(() => {
    getMyWidgets()
      .then(setWidgets)
      .finally(() => setFetching(false))
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleDelete = async (id: string) => {
    await deleteWidget(id)
    setWidgets(prev => prev.filter(w => w.id !== id))
  }

  const handleFABGenerate = (type: ElementType) => {
    setElementType(type)
    setModalOpen(true)
  }

  const handleGenerate = (payload: GeneratePayload) => {
    // POST /widgets - guardar en BD - agregar a la lista
    console.log('Nuevo widget:', payload)
  }

  const defaultWidgets  = widgets.filter(w => w.isDefault)
  const personalWidgets = widgets.filter(w => !w.isDefault)

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

        {/* Loading */}
        {fetching && (
          <div className="flex justify-center py-20">
            <svg className="animate-spin w-8 h-8 text-[var(--color-hi-primary)]"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25}/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
          </div>
        )}

        {!fetching && (
          <>
            {/* Widgets default del rol */}
            {defaultWidgets.length > 0 && (
              <section className="mb-8">
                <p className="text-xs font-semibold text-[var(--color-hi-text-sub)]
                  uppercase tracking-wide mb-4">
                  Indicadores de tu rol
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {defaultWidgets.map(w => (
                    <WidgetRenderer key={w.id} widget={w} onDelete={() => handleDelete(w.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Widgets personales */}
            {personalWidgets.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-[var(--color-hi-text-sub)]
                  uppercase tracking-wide mb-4">
                  Mis elementos
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {personalWidgets.map(w => (
                    <WidgetRenderer key={w.id} widget={w} onDelete={() => handleDelete(w.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {personalWidgets.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16
                rounded-[var(--radius-lg)] border border-dashed border-[var(--color-hi-border)]
                bg-[var(--color-hi-surface)]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-hi-text-hint)" strokeWidth={1.5} strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                <p className="text-sm text-[var(--color-hi-text-hint)] text-center max-w-xs">
                  Agrega elementos personalizados con{' '}
                  <strong className="text-[var(--color-hi-primary)]">+</strong>
                </p>
              </div>
            )}
          </>
        )}

      </main>

      <FAB onGenerate={handleFABGenerate} />

      <GenerateElementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        elementType={elementType}
        onGenerate={handleGenerate}
      />

    </div>
  )
}