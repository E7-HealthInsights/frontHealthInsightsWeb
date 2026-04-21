import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }      from '../context/AuthContext'
import { logout }       from '../services/authService'

import Navbar                from '../components/common/Navbar'
import FAB                   from '../components/features/dashboard/FAB/FAB'
import GenerateElementModal  from '../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import ChartCard             from '../components/features/dashboard/CardElements/ChartCard/ChartCard'
import StatCard              from '../components/features/dashboard/CardElements/StatCard/StatCard'
import GenerateReportButton  from '../components/features/reports/GenerateReportButton/GenerateReportButton'

import type { ElementType, GeneratePayload, DashboardWidget } from '../types/Widget'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

// ── Datos mock para widgets de ejemplo ───────────────────────────────────────
// Se muestran al cargar el dashboard. TODO Bloque 2 vendrán del backend (GET /widgets).

const MOCK_CHART_DATA = [
  { estado: 'Jalisco',    casos: 142 },
  { estado: 'CDMX',       casos: 310 },
  { estado: 'Tabasco',    casos: 88  },
  { estado: 'Nuevo León', casos: 195 },
  { estado: 'Oaxaca',     casos: 67  },
]

const INITIAL_WIDGETS: DashboardWidget[] = [
  {
    id:         'w-demo-1',
    title:      'Casos de diabetes por estado',
    dataSource: 'diabetes_2023',
    chartType:  'barras',
    params:     [{ slotKey: 'eje_x', column: 'estado' }, { slotKey: 'eje_y', column: 'casos' }],
    data:       MOCK_CHART_DATA,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Genera datos mock según los parámetros del widget.
 *  TODO Bloque 2: reemplazar con llamada a GET /widgets/{id}/data  */
function buildMockData(payload: GeneratePayload): Record<string, string | number>[] {
  return [
    { [payload.params[0]?.column ?? 'x']: 'Jalisco',    [payload.params[1]?.column ?? 'y']: 142 },
    { [payload.params[0]?.column ?? 'x']: 'CDMX',       [payload.params[1]?.column ?? 'y']: 310 },
    { [payload.params[0]?.column ?? 'x']: 'Tabasco',    [payload.params[1]?.column ?? 'y']: 88  },
    { [payload.params[0]?.column ?? 'x']: 'Nuevo León', [payload.params[1]?.column ?? 'y']: 195 },
  ]
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()

  // Estado del modal de generación
  const [modalOpen,    setModalOpen]    = useState(false)
  const [elementType,  setElementType]  = useState<ElementType>('grafica')

  // Lista de widgets del dashboard
  const [widgets, setWidgets] = useState<DashboardWidget[]>(INITIAL_WIDGETS)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout()
    setUser(null)
    navigate('/login', { replace: true })
  }

  /** El FAB llama a esto con el tipo elegido → abre el modal de configuración */
  const handleFABGenerate = (type: ElementType) => {
    setElementType(type)
    setModalOpen(true)
  }

  /** El modal llama a esto cuando el usuario confirma → agrega el widget al grid */
  const handleGenerate = (payload: GeneratePayload) => {
    const newWidget: DashboardWidget = {
      id:         `w-${Date.now()}`,
      title:      payload.title,
      dataSource: payload.dataSource,
      chartType:  payload.chartType,
      params:     payload.params,
      data:       buildMockData(payload),   // TODO Bloque 2: llamar al backend
    }
    setWidgets(prev => [...prev, newWidget])
  }

  /** Elimina un widget del grid */
  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
  }

  // ── Render ────────────────────────────────────────────────────────────────

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

        {/* Stats fijos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Gasto Total"       value="$1.2B"  subtitle="Presupuesto total"        title="Gasto Total 2025"      />
          <StatCard label="Gasto en Diabetes" value="$320M"  subtitle="35% del presupuesto"      title="Gasto en Diabetes 2025"/>
          <StatCard label="Desviación"        value="+8.5%"  subtitle="Por encima del presupuesto" title="Desviación 2025"     />
          <StatCard label="Proyecciones"      value="3"      subtitle="Escenarios activos"        title="Proyecciones 2025"    />
        </div>

        {/* Grid de widgets generados por el usuario */}
        {widgets.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[var(--color-hi-text-sub)] mb-4 uppercase tracking-wide">
              Mis elementos
            </h2>

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

        {/* Estado vacío */}
        {widgets.length === 0 && (
          <div className="
            flex flex-col items-center justify-center gap-3 py-20
            rounded-[var(--radius-lg)]
            border border-dashed border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)]
          ">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-hi-text-hint)" strokeWidth={1.5} strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <p className="text-sm text-[var(--color-hi-text-hint)]">
              Tu dashboard está vacío. Presiona <strong className="text-[var(--color-hi-primary)]">+</strong> para agregar un elemento.
            </p>
          </div>
        )}

      </main>

      {/* FAB — abre el selector de tipo */}
      <FAB onGenerate={handleFABGenerate} />

      {/* Modal de configuración del elemento */}
      <GenerateElementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        elementType={elementType}
        onGenerate={handleGenerate}
      />

    </div>
  )
}

// ── WidgetRenderer ────────────────────────────────────────────────────────────
// Decide qué componente renderizar según el chartType del widget.

function WidgetRenderer({
  widget,
  onDelete,
}: {
  widget:   DashboardWidget
  onDelete: () => void
}) {
  const xKey   = widget.params.find(p => p.slotKey === 'eje_x')?.column
              ?? widget.params.find(p => p.slotKey === 'categoria')?.column
              ?? widget.params[0]?.column
              ?? 'x'

  const yKey   = widget.params.find(p => p.slotKey === 'eje_y')?.column
              ?? widget.params.find(p => p.slotKey === 'valor')?.column
              ?? widget.params[1]?.column
              ?? 'y'

  const actions = [
    { label: 'Eliminar', onClick: onDelete, danger: true as const },
  ]

  // Indicador / card
  if (widget.chartType === 'card') {
    const row   = widget.data?.[0]
    const valor = row ? row[widget.params[0]?.column ?? ''] : '—'
    return (
      <StatCard
        title={widget.title}
        subtitle={widget.dataSource}
        value={String(valor)}
        label={widget.params[0]?.column ?? ''}
      />
    )
  }

  // Tabla
  if (widget.chartType === 'tabla') {
    const cols = widget.params.map(p => p.column).filter(Boolean)
    return (
      <div className="bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)]
        border border-[var(--color-hi-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-hi-text-main)]">
            {widget.title}
          </h3>
          <button onClick={onDelete}
            className="text-xs text-[var(--color-hi-danger)] hover:underline cursor-pointer">
            Eliminar
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                {cols.map(col => (
                  <th key={col} className="px-2 py-1.5 border border-[var(--color-hi-border)]
                    text-[var(--color-hi-text-sub)] font-semibold bg-[var(--color-hi-bg)]">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(widget.data ?? []).map((row, i) => (
                <tr key={i}>
                  {cols.map(col => (
                    <td key={col} className="px-2 py-1 border border-[var(--color-hi-border)]
                      text-[var(--color-hi-text-main)]">
                      {String(row[col] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Gráficas (barras, lineas, pastel, dispersion)
  const chartTypeMap: Record<string, 'bar' | 'line' | 'pie'> = {
    barras:     'bar',
    lineas:     'line',
    pastel:     'pie',
    dispersion: 'bar',   // fallback hasta implementar scatter
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