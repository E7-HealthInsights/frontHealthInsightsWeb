import { useRef, useState, useCallback } from 'react'
import { useNavigate }          from 'react-router-dom'
import { useAuth }              from '../context/AuthContext'
import { logout }               from '../services/authService'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { createReporte }        from '../services/reportService'
import { useGenerarPDF }        from '../hooks/useGenerarPDF'
import GenerateReportButton     from '../components/features/reports/GenerateReportButton/GenerateReportButton'

import Navbar               from '../components/common/Navbar'
import Card                 from '../components/common/Card/Card'
import StatCard             from '../components/features/dashboard/CardElements/StatCard/StatCard'
import ChartCard            from '../components/features/dashboard/CardElements/ChartCard/ChartCard'
import HeatmapCard          from '../components/features/dashboard/CardElements/HeatmapCard/HeatmapCard'
import DataTable, { type Column } from '../components/common/DataTable/DataTable'
import FAB                  from '../components/features/dashboard/FAB/FAB'
import GenerateElementModal from '../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import type { ElementType, FABSelection } from '../components/features/dashboard/FAB/FAB'
import {
  getMyWidgets,
  deleteWidget,
  updateWidgetOrden,
  isChartData,
  isErrorData,
  isMultiSeriesData,
  isStatData,
  isTableData,
  isHeatmapData,
  type ChartWidgetData,
  type MultiSeriesPoint,
  type StatWidgetData,
  type TableRow,
  type WidgetDTO,
} from '../services/widgetService'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { key: 'inicio',       label: 'Inicio',       path: '/'             },
  { key: 'proyecciones', label: 'Proyecciones', path: '/proyecciones' },
  { key: 'reportes',     label: 'Reportes',     path: '/reportes'     },
]

const CHART_TYPE_MAP = {
  LINE: 'line',
  BAR:  'bar',
  PIE:  'pie',
} as const

// ── Helpers para Mercadotecnia ────────────────────────────────────────────────

const KEEP_AGE_GROUPS = new Set<string>([
  '20-24 years','25-29 years','30-34 years','35-39 years','40-44 years',
  '45-49 years','50-54 years','55-59 years','60-64 years','65-69 years',
  '70-74 years','75-79 years','80-84 years','85+ years',
  '5-9 years','10-19 years','20+ years',
])

const ageGroupLowerBound = (label: string): number => {
  const match = label.match(/^(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

const maybeFilterAgeGroups = (points: MultiSeriesPoint[]): MultiSeriesPoint[] => {
  const looksLikeAge = points.some(
    p => typeof p.label === 'string' && KEEP_AGE_GROUPS.has(p.label)
  )
  if (!looksLikeAge) return points
  return points
    .filter(p => typeof p.label === 'string' && KEEP_AGE_GROUPS.has(p.label))
    .sort((a, b) => ageGroupLowerBound(a.label as string) - ageGroupLowerBound(b.label as string))
}

const SERIES_LABEL_MAP: Record<string, string> = {
  'Prevalence of obesity among children and adolescents, BMI > +2 standard deviations above the median (crude estimate) (%)': 'Obesidad infantil',
  'Prevalence of overweight among children and adolescents, BMI > +1 standard deviation above the median (crude estimate) (%)': 'Sobrepeso infantil',
  'Prevalence of obesity among adults, BMI ≥ 30 kg/m² (age-standardized estimate) (%)': 'Obesidad adultos (ajust.)',
  'Prevalence of obesity among adults, BMI ≥ 30 kg/m² (crude estimate) (%)': 'Obesidad adultos (crudo)',
  'Prevalence of overweight among adults, BMI ≥ 25 kg/m² (age-standardized estimate) (%)': 'Sobrepeso adultos (ajust.)',
  'Prevalence of overweight among adults, BMI ≥ 25 kg/m² (crude estimate) (%)': 'Sobrepeso adultos (crudo)',
}

const shortenSeries = (key: string) => SERIES_LABEL_MAP[key] ?? key

// ── Helpers de formato ────────────────────────────────────────────────────────

const formatStatValue = (v: number | string) =>
  typeof v === 'number' ? v.toLocaleString('es-MX') : v

const resolveStatLabel = (titulo: string, data: StatWidgetData): string | undefined => {
  if (data.label) return data.label
  if (typeof data.value === 'string') return undefined
  if (titulo.trim().startsWith('%') || /porcentaje|prevalencia/i.test(titulo)) return '%'
  return undefined
}

// ── WidgetRenderer ────────────────────────────────────────────────────────────

function WidgetRenderer({ widget, onDelete, hideActions = false }: { widget: WidgetDTO; onDelete: () => void; hideActions?: boolean }) {
  const isDefault = widget.esDefault || hideActions
  const actions   = isDefault
    ? []
    : [{ label: 'Eliminar', onClick: onDelete, danger: true as const }]

  // ── Error de query en el backend ──────────────────────────────────────────
  if (isErrorData(widget.data)) {
    return (
      <div className="bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
        rounded-[var(--radius-lg)] p-5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--color-hi-text-main)]">
            {widget.titulo}
          </p>
          {actions.length > 0 && (
            <button
              onClick={onDelete}
              className="text-xs text-[var(--color-hi-danger)] hover:underline shrink-0"
            >
              Eliminar
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--color-hi-danger)]">{widget.data.error}</p>
      </div>
    )
  }

  // ── STAT ──────────────────────────────────────────────────────────────────
  if (widget.tipo === 'STAT' && isStatData(widget.data)) {
    return (
      <StatCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        value={formatStatValue(widget.data.value)}
        label={resolveStatLabel(widget.titulo, widget.data)}
        actions={actions}
      />
    )
  }

  // ── MULTISERIES (líneas o barras agrupadas con múltiples series) ──────────
  if (widget.tipo === 'MULTISERIES' && isMultiSeriesData(widget.data)) {
    const filteredPoints = maybeFilterAgeGroups(widget.data.data)
    const series = widget.data.seriesKeys.map(key => ({
      dataKey: key,
      name:    shortenSeries(key),
    }))

    // Fusionar series infantiles + adultas en una sola línea por métrica.
    // PAHO entrega "children/adolescents" en 5-9 y 10-19, y "adults" agregado en 20+.
    // Para tener líneas continuas usamos los "crude estimate" de adultos
    // (la misma metodología que los datos infantiles).
    const obesityChildKey = widget.data.seriesKeys.find(k => /obesity.*children|obesity.*adolescents/i.test(k))
    const overweightChildKey = widget.data.seriesKeys.find(k => /overweight.*children|overweight.*adolescents/i.test(k))
    const obesityAdultCrudeKey = widget.data.seriesKeys.find(k => /obesity.*adults.*crude/i.test(k))
    const overweightAdultCrudeKey = widget.data.seriesKeys.find(k => /overweight.*adults.*crude/i.test(k))

    if (obesityChildKey && overweightChildKey && obesityAdultCrudeKey && overweightAdultCrudeKey) {
      const mergedPoints = filteredPoints.map(p => {
        const isAdult = typeof p.label === 'string' && /20\+/.test(p.label)
        return {
          label:     p.label,
          Obesidad:  Number(isAdult ? p[obesityAdultCrudeKey] : p[obesityChildKey]) || 0,
          Sobrepeso: Number(isAdult ? p[overweightAdultCrudeKey] : p[overweightChildKey]) || 0,
        }
      })

      return (
        <ChartCard
          title={widget.titulo}
          subtitle={widget.subtitulo}
          tipo="line"
          data={mergedPoints as Record<string, string | number>[]}
          xKey="label"
          xAxisLabel={widget.xAxisLabel}
          yAxisLabel={widget.yAxisLabel}
          series={[
            { dataKey: 'Obesidad',  name: 'Obesidad' },
            { dataKey: 'Sobrepeso', name: 'Sobrepeso' },
          ]}
          actions={actions}
          height={340}
          className="sm:col-span-2 md:col-span-3"
        />
      )
    }

    return (
      <ChartCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        tipo="line"
        data={filteredPoints as Record<string, string | number>[]}
        xKey="label"
        xAxisLabel={widget.xAxisLabel}
        yAxisLabel={widget.yAxisLabel}
        series={series}
        actions={actions}
        height={260}
      />
    )
  }

  // ── LINE / BAR / PIE ──────────────────────────────────────────────────────
  if (isChartData(widget.data)) {
    const chartData = widget.data as ChartWidgetData

    const rechartData = chartData.labels.map((lbl, i) => ({
      label: String(lbl),
      value: parseFloat(String(chartData.values[i] ?? '0')),
    }))

    return (
      <ChartCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        tipo={CHART_TYPE_MAP[widget.tipo as keyof typeof CHART_TYPE_MAP] ?? 'bar'}
        data={rechartData}
        xKey="label"
        xAxisLabel={widget.xAxisLabel}
        yAxisLabel={widget.yAxisLabel}
        series={[{ dataKey: 'value', name: widget.seriesName ?? widget.titulo }]}
        actions={actions}
        height={260}
      />
    )
  }

  // ── TABLE (Gabo) ──────────────────────────────────────────────────────────
  if (widget.tipo === 'TABLE' && isTableData(widget.data)) {
    const { columns, rows } = widget.data
    const sample      = rows[0] ?? {}
    const numericCols = columns.filter(c => typeof sample[c] === 'number')
    const labelCols   = columns.filter(c => typeof sample[c] !== 'number')
    const useHeatmap  = numericCols.length >= 2 && labelCols.length >= 1

    if (useHeatmap) {
      return (
        <HeatmapCard
          title={widget.titulo}
          subtitle={widget.subtitulo}
          rowKey={labelCols[0]}
          valueColumns={numericCols}
          rows={rows}
          actions={actions}
          className="sm:col-span-2 md:col-span-3"
        />
      )
    }

    // Caso B: triplete plano (yKey, xKey, valueKey) → pivotar y mostrar como heatmap
    if (labelCols.length === 2 && numericCols.length === 1) {
      const [yKey, xKey] = labelCols
      const valueKey     = numericCols[0]
      const stateMap     = new Map<string, Record<string, string | number | null>>()
      const colSet       = new Set<string>()
      for (const row of rows) {
        const state = String(row[yKey] ?? '')
        const col   = String(row[xKey] ?? '')
        const value = Number(row[valueKey])
        colSet.add(col)
        if (!stateMap.has(state)) stateMap.set(state, { [yKey]: state })
        stateMap.get(state)![col] = value
      }
      const pivotCols   = [...colSet].sort()
      const pivotedRows = [...stateMap.values()].map(row => {
        for (const col of pivotCols) if (!(col in row)) row[col] = null
        return row
      })
      return (
        <HeatmapCard
          title={widget.titulo}
          subtitle={widget.subtitulo}
          rows={pivotedRows}
          rowKey={yKey}
          valueColumns={pivotCols}
          actions={actions}
          className="sm:col-span-2 md:col-span-3"
        />
      )
    }

    const tableCols: Column<TableRow & { id?: string | number }>[] = columns.map(c => ({
      key:    c,
      header: c.replace(/_/g, ' ').replace(/\b\w/g, x => x.toUpperCase()),
      render: row => {
        const v = row[c]
        if (typeof v === 'number') return v.toLocaleString('es-MX')
        return v ?? '—'
      },
    }))

    return (
      <Card
        title={widget.titulo}
        subtitle={widget.subtitulo}
        actions={actions}
        className="md:col-span-2"
      >
        <DataTable<TableRow & { id?: string | number }>
          columns={tableCols}
          data={rows as (TableRow & { id?: string | number })[]}
        />
      </Card>
    )
  }

  // ── HEATMAP (Omar) ────────────────────────────────────────────────────────
  if (isHeatmapData(widget.data)) {
    const { rows } = widget.data
    if (!rows.length) return null

    const [yKey, xKey, valueKey] = Object.keys(rows[0])

    const stateMap = new Map<string, Record<string, string | number | null>>()
    const yearSet  = new Set<string>()

    for (const row of rows) {
      const state = String(row[yKey])
      const year  = String(row[xKey])
      const value = Number(row[valueKey])
      yearSet.add(year)
      if (!stateMap.has(state)) stateMap.set(state, { [yKey]: state })
      stateMap.get(state)![year] = value
    }

    const years      = [...yearSet].sort()
    const pivotedRows = [...stateMap.values()].map(row => {
      for (const year of years) {
        if (!(year in row)) row[year] = null
      }
      return row
    })

    return (
      <HeatmapCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        rows={pivotedRows}
        rowKey={yKey}
        valueColumns={years}
        actions={actions}
        className="sm:col-span-2 md:col-span-3"
      />
    )
  }

  return null
}

// ── SortableWidget — wrapper para drag & drop de widgets personales ───────────

function SortableWidget({ widget, onDelete }: { widget: WidgetDTO; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.5 : 1,
    cursor:    'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WidgetRenderer widget={widget} onDelete={onDelete} />
    </div>
  )
}

// ── DashboardPage ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const queryClient       = useQueryClient()

  const [modalOpen,     setModalOpen]     = useState(false)
  const [fabSelection,  setFabSelection]  = useState<FABSelection | null>(null)

  const reporteRef             = useRef<HTMLDivElement>(null)
  const { generar, generando } = useGenerarPDF()

  const { data: widgets = [], isLoading, isError } = useQuery({
    queryKey: ['myWidgets'],
    queryFn:  getMyWidgets,
    staleTime: 5 * 60 * 1000,
  })

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Leemos el estado actual directo del cache para evitar dependencia en el closure
    const current        = queryClient.getQueryData<WidgetDTO[]>(['myWidgets']) ?? []
    const personalWidgets = current.filter(w => !w.esDefault)
    const oldIndex = personalWidgets.findIndex(w => w.id === active.id)
    const newIndex = personalWidgets.findIndex(w => w.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(personalWidgets, oldIndex, newIndex)

    // Actualización optimista: reasignar orden consecutivo
    const items = reordered.map((w, i) => ({ id: w.id, orden: i + 1 }))
    queryClient.setQueryData<WidgetDTO[]>(['myWidgets'], prev => {
      if (!prev) return prev
      const defaults = prev.filter(w => w.esDefault)
      const updated  = items.map(item => {
        const widget = prev.find(w => w.id === item.id)!
        return { ...widget, orden: item.orden }
      })
      return [...defaults, ...updated]
    })

    // Persistir en backend (silencioso — si falla, el próximo refresh corrige)
    updateWidgetOrden(items).catch(() => {
      queryClient.invalidateQueries({ queryKey: ['myWidgets'] })
    })
  }, [queryClient])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  const handleDelete = async (id: string) => {
    await deleteWidget(id)
    queryClient.setQueryData<WidgetDTO[]>(
      ['myWidgets'],
      prev => prev?.filter(w => w.id !== id)
    )
  }

  const handleFABGenerate = (selection: FABSelection) => {
    setFabSelection(selection)
    setModalOpen(true)
  }

  const handleWidgetSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['myWidgets'] })
  }

  const handleGenerarReporte = async () => {
    if (!reporteRef.current) return
    const mes    = new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })
    const titulo = `Dashboard ${user?.name} — ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
    await generar(reporteRef.current, titulo)
    createReporte({ titulo, tipo: 'DASHBOARD' }).catch(() => {})
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
            Hola, {user?.name}
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            {user?.role} · {user?.email}
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

        {/* Error de red */}
        {isError && (
          <div className="flex justify-center py-20">
            <p className="text-sm text-[var(--color-hi-danger)]">
              No se pudieron cargar los widgets. Intenta recargar la página.
            </p>
          </div>
        )}

        {/* Grid de widgets */}
        <div>
          {!isLoading && !isError && (() => {
            const defaultWidgets  = widgets.filter(w => w.esDefault)
            const personalWidgets = widgets.filter(w => !w.esDefault)
            return (
              <>
                {/* Widgets del rol */}
                {defaultWidgets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {defaultWidgets.map(w => (
                      <WidgetRenderer
                        key={w.id}
                        widget={w}
                        onDelete={() => handleDelete(w.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Separador — solo si hay widgets personales */}
                {personalWidgets.length > 0 && (
                  <div className="flex items-center gap-3 mt-8 mb-4">
                    <span className="text-sm font-semibold text-[var(--color-hi-text-sub)] whitespace-nowrap">
                      Mis widgets
                    </span>
                    <div className="flex-1 h-px bg-[var(--color-hi-border)]" />
                  </div>
                )}

                {/* Widgets personales */}
                {personalWidgets.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={personalWidgets.map(w => w.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {personalWidgets.map(w => (
                          <SortableWidget
                            key={w.id}
                            widget={w}
                            onDelete={() => handleDelete(w.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </>
            )
          })()}

          {/* Empty state */}
          {!isLoading && !isError && widgets.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16
              rounded-[var(--radius-lg)] border border-dashed border-[var(--color-hi-border)]
              bg-[var(--color-hi-surface)]">
              <p className="text-sm text-[var(--color-hi-text-hint)]">
                No hay widgets configurados aún.
              </p>
            </div>
          )}
        </div>

        {/* Botón fuera del ref para que no aparezca en el PDF */}
        {!isLoading && !isError && widgets.length > 0 && (
          <div className="flex justify-end mt-6">
            <GenerateReportButton
              onClick={handleGenerarReporte}
              loading={generando}
            />
          </div>
        )}

      </main>

      <FAB onGenerate={handleFABGenerate} />

      {fabSelection && (
        <GenerateElementModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          elementType={fabSelection.elementType}
          datasetId={fabSelection.datasetId}
          nombreTabla={fabSelection.nombreTabla}
          currentWidgetCount={widgets.length}
          onSaved={handleWidgetSaved}
        />
      )}

      {/* Contenido del PDF — fuera de pantalla */}
      <div
        ref={reporteRef}
        aria-hidden="true"
        className="fixed top-0 bg-white p-8"
        style={{ left: '-9999px', width: '1100px' }}
      >
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[var(--color-hi-navy)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-1">
            Generado por: {user?.name} {user?.lastName} &nbsp;·&nbsp; {new Date().toLocaleDateString('es-MX')}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {widgets.map(w => (
            <WidgetRenderer
              key={`pdf-${w.id}`}
              widget={w}
              onDelete={() => {}}
              hideActions
            />
          ))}
        </div>
      </div>

    </div>
  )
}