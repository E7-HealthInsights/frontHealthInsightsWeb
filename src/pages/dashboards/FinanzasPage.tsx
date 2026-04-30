import { useState }          from 'react'
import { useNavigate }        from 'react-router-dom'
import { useAuth }            from '../../context/AuthContext'
import { logout }             from '../../services/authService'

import Navbar                 from '../../components/common/Navbar'
import StatCard               from '../../components/features/dashboard/CardElements/StatCard/StatCard'
import FAB                    from '../../components/features/dashboard/FAB/FAB'
import GenerateElementModal   from '../../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import ChartCard              from '../../components/features/dashboard/CardElements/ChartCard/ChartCard'

import { IDF_MEXICO }         from '../../data/idfMexico'
import type { ElementType, GeneratePayload, DashboardWidget } from '../../types/Widget'

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]


function buildMockData(payload: GeneratePayload): Record<string, string | number>[] {
  return [
    { [payload.params[0]?.column ?? 'x']: 'Jalisco',    [payload.params[1]?.column ?? 'y']: 142 },
    { [payload.params[0]?.column ?? 'x']: 'CDMX',       [payload.params[1]?.column ?? 'y']: 310 },
    { [payload.params[0]?.column ?? 'x']: 'Tabasco',    [payload.params[1]?.column ?? 'y']: 88  },
    { [payload.params[0]?.column ?? 'x']: 'Nuevo León', [payload.params[1]?.column ?? 'y']: 195 },
  ]
}

const chartTypeMap: Record<string, 'bar' | 'line' | 'pie'> = {
    barras:     'bar',
    lineas:     'line',
    pastel:     'pie',
    dispersion: 'bar',
  }


export default function FinanzasPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [elementType, setElementType] = useState<ElementType>('grafica')
  const [widgets,     setWidgets]     = useState<DashboardWidget[]>([])


  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const handleFABGenerate = (type: ElementType) => {
    setElementType(type)
    setModalOpen(true)
  }

  const handleGenerate = (payload: GeneratePayload) => {
    const newWidget: DashboardWidget = {
      id:         `w-${Date.now()}`,
      title:      payload.title,
      dataSource: payload.dataSource,
      chartType:  payload.chartType,
      params:     payload.params,
      data:       buildMockData(payload),
    }
    setWidgets(prev => [...prev, newWidget])
  }

  const handleDeleteWidget = (id: string) =>
    setWidgets(prev => prev.filter(w => w.id !== id))

  //  IDF data — se usará del backend cuando esté listo
  const gastoTotal    = IDF_MEXICO.healthExpenditure.totalUsdMillions
  const gastoPorPersona = IDF_MEXICO.healthExpenditure.perPersonUsd

  // Crecimiento proyectado gasto total 2024→2050
  const crecimientoGasto = (
    ((gastoTotal.y2050 - gastoTotal.y2024) / gastoTotal.y2024) * 100
  ).toFixed(1)

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
            Director de Finanzas · Vista financiera de la diabetes en México
          </p>
        </div>

        {/* KPI Cards — datos IDF México 2024 ─────────────────────────── */}
        <section className="mb-8">
          <p className="text-xs font-semibold text-[var(--color-hi-text-sub)]
            uppercase tracking-wide mb-4">
            Indicadores clave
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Gasto total */}
            <StatCard
              title="Gasto total en diabetes"
              label={`USD millones · Proyección 2050: $${gastoTotal.y2050.toLocaleString('es-MX')}M (+${crecimientoGasto}%)`}
              value={`$${gastoTotal.y2024.toLocaleString('es-MX')}M`}
              subtitle="Fuente: IDF 2024"
            />

            {/* Gasto per cápita */}
            <StatCard
              title="Gasto per cápita"
              label="Fuente: IDF 2024"
              value={`$${gastoPorPersona.y2024.toLocaleString('es-MX')}`}
              subtitle={`USD por persona · En 2011 era $${gastoPorPersona.y2011}`}
            />

            {/* Personas con diabetes */}
            <StatCard
              title="Personas con diabetes"
              label="Fuente: IDF 2024"
              value={`${IDF_MEXICO.peopleWithDiabetes.y2024.toLocaleString('es-MX')}M`}
              subtitle={`miles de personas · ${IDF_MEXICO.undiagnosed.proportion}% no diagnosticadas`}
            />

          </div>
        </section>

        {/* ── Widgets creados por el usuario ────────────────────────────── */}
        {widgets.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-[var(--color-hi-text-sub)]
              uppercase tracking-wide mb-4">
              Mis elementos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {widgets.map(widget => (
                <WidgetRenderer
                  key={widget.id}
                  widget={widget}
                  onDelete={() => handleDeleteWidget(widget.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Estado vacío — solo si no hay widgets del usuario */}
        {widgets.length === 0 && (
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

function WidgetRenderer({
  widget,
  onDelete,
}: {
  widget:   DashboardWidget
  onDelete: () => void
}) {
  const xKey = widget.params.find(p => p.slotKey === 'eje_x')?.column
            ?? widget.params[0]?.column ?? 'x'
  const yKey = widget.params.find(p => p.slotKey === 'eje_y')?.column
            ?? widget.params[1]?.column ?? 'y'

  const actions = [{ label: 'Eliminar', onClick: onDelete, danger: true as const }]

  if (widget.chartType === 'card') {
    const valor = widget.data?.[0]?.[widget.params[0]?.column ?? ''] ?? '—'
    return (
      <StatCard
        title={widget.title}
        subtitle={widget.dataSource}
        value={String(valor)}
        label={widget.params[0]?.column ?? ''}
      />
    )
  }

  return (
    <ChartCard
      title={widget.title}
      subtitle={widget.dataSource}
      tipo={chartTypeMap[widget.chartType] ?? 'bar'}
      data={widget.data ?? []}
      series={[{ dataKey: yKey, name: yKey }]}
      xKey={xKey}
      actions={actions}
    />
  )
}