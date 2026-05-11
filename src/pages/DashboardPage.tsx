import { useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { logout }              from '../services/authService'


import Navbar               from '../components/common/Navbar'
import Card                 from '../components/common/Card/Card'
import StatCard             from '../components/features/dashboard/CardElements/StatCard/StatCard'
import ChartCard            from '../components/features/dashboard/CardElements/ChartCard/ChartCard'
import HeatmapCard          from '../components/features/dashboard/CardElements/HeatmapCard/HeatmapCard'
import DataTable, { type Column } from '../components/common/DataTable/DataTable'
import FAB                  from '../components/features/dashboard/FAB/FAB'
import GenerateElementModal from '../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import type { ElementType, GeneratePayload } from '../types/Widget'
import {
  getMyWidgets,
  isChartData,
  isErrorData,
  isMultiSeriesData,
  isStatData,
  isTableData,
  type ChartWidgetData,
  type MultiSeriesPoint,
  type StatWidgetData,
  type TableRow,
  type WidgetDTO,
} from '../services/widgetService'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

// Grupos de edad legibles para los widgets MULTISERIES de Mercadotecnia
// (HU HI-485): dejamos quinquenales adultos + bandas de PAHO que no se solapan,
// y descartamos All ages, Age-standardized, pediátricos solapados, etc.
const KEEP_AGE_GROUPS = new Set<string>([
  '20-24 years','25-29 years','30-34 years','35-39 years','40-44 years',
  '45-49 years','50-54 years','55-59 years','60-64 years','65-69 years',
  '70-74 years','75-79 years','80-84 years','85+ years',
  '5-9 years','10-19 years','20+ years',
])

const maybeFilterAgeGroups = (points: MultiSeriesPoint[]): MultiSeriesPoint[] => {
  const looksLikeAge = points.some(
    p => typeof p.label === 'string' && KEEP_AGE_GROUPS.has(p.label)
  )
  if (!looksLikeAge) return points
  return points.filter(
    p => typeof p.label === 'string' && KEEP_AGE_GROUPS.has(p.label)
  )
}

// Mapping para nombres oficiales PAHO (widget orden 6) → etiquetas cortas
const SERIES_LABEL_MAP: Record<string, string> = {
  'Prevalence of obesity among children and adolescents, BMI > +2 standard deviations above the median (crude estimate) (%)': 'Obesidad infantil',
  'Prevalence of overweight among children and adolescents, BMI > +1 standard deviation above the median (crude estimate) (%)': 'Sobrepeso infantil',
  'Prevalence of obesity among adults, BMI ≥ 30 kg/m² (age-standardized estimate) (%)': 'Obesidad adultos (ajust.)',
  'Prevalence of obesity among adults, BMI ≥ 30 kg/m² (crude estimate) (%)': 'Obesidad adultos (crudo)',
  'Prevalence of overweight among adults, BMI ≥ 25 kg/m² (age-standardized estimate) (%)': 'Sobrepeso adultos (ajust.)',
  'Prevalence of overweight among adults, BMI ≥ 25 kg/m² (crude estimate) (%)': 'Sobrepeso adultos (crudo)',
}

const shortenSeries = (key: string) => SERIES_LABEL_MAP[key] ?? key

const formatStatValue = (v: number | string) =>
  typeof v === 'number' ? v.toLocaleString('es-MX') : v

// Infiere la unidad de un STAT: usa la del backend si existe; si no, deduce
// "%" cuando el título arranca/menciona porcentaje; para valores textuales,
// no muestra unidad.
const resolveStatLabel = (
  titulo: string,
  data: StatWidgetData,
): string | undefined => {
  if (data.label) return data.label
  if (typeof data.value === 'string') return undefined
  if (titulo.trim().startsWith('%') || /porcentaje|prevalencia/i.test(titulo)) {
    return '%'
  }
  return undefined
}

function WidgetRenderer({
  widget,
  onDelete,
}: {
  widget:   WidgetDTO
  onDelete: () => void
}) {
  const isDefault = !('usuario' in widget)
  const actions   = isDefault
    ? []
    : [{ label: 'Eliminar', onClick: onDelete, danger: true as const }]

  // Error de query en el backend
  if (isErrorData(widget.data)) {
    return (
      <div className="bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
        rounded-[var(--radius-lg)] p-5">
        <p className="text-xs font-semibold text-[var(--color-hi-text-main)] mb-2">
          {widget.titulo}
        </p>
        <p className="text-xs text-[var(--color-hi-danger)]">
          {widget.data.error}
        </p>
      </div>
    )
  }

  // STAT (admite value numérico o string)
  if (widget.tipo === 'STAT' && isStatData(widget.data)) {
    return (
      <StatCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        value={formatStatValue(widget.data.value)}
        label={resolveStatLabel(widget.titulo, widget.data)}
      />
    )
  }

  // MULTISERIES (BarChart agrupado)
  if (widget.tipo === 'MULTISERIES' && isMultiSeriesData(widget.data)) {
    const filteredPoints = maybeFilterAgeGroups(widget.data.data)
    const series = widget.data.seriesKeys.map(key => ({
      dataKey: key,
      name:    shortenSeries(key),
    }))

    return (
      <ChartCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        tipo="bar"
        data={filteredPoints as Record<string, string | number>[]}
        xKey="label"
        xAxisLabel={widget.xAxisLabel}
        yAxisLabel={widget.yAxisLabel}
        series={series}
        actions={actions}
        height={340}
        className="sm:col-span-2 md:col-span-3"
      />
    )
  }

  // LINE / BAR / PIE
  if (isChartData(widget.data)) {
    const chartData = widget.data as ChartWidgetData

    // Transforma {labels[], values[]} → [{label, value}] para Recharts
    const rechartData = chartData.labels.map((lbl, i) => ({
      label: String(lbl),
      value: chartData.values[i] ?? 0,
    }))

    // LINE/BAR con muchos puntos: ocupa fila completa y sube altura para
    // que las etiquetas rotadas del eje X no se solapen.
    const isWide = rechartData.length >= 10
    const className = isWide ? 'sm:col-span-2 md:col-span-3' : undefined
    const height    = isWide ? 320 : 220

    return (
      <ChartCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        tipo={CHART_TYPE_MAP[widget.tipo as keyof typeof CHART_TYPE_MAP] ?? 'bar'}
        data={rechartData}
        xKey="label"
        xAxisLabel={widget.xAxisLabel}
        yAxisLabel={widget.yAxisLabel}
        series={[{
          dataKey: 'value',
          name:    widget.seriesName ?? widget.titulo,
        }]}
        actions={actions}
        height={height}
        className={className}
      />
    )
  }

  // TABLE → heatmap si hay ≥2 columnas numéricas, si no DataTable simple
  if (widget.tipo === 'TABLE' && isTableData(widget.data)) {
    const { columns, rows } = widget.data
    const sample = rows[0] ?? {}
    const numericCols   = columns.filter(c => typeof sample[c] === 'number')
    const labelCols     = columns.filter(c => typeof sample[c] !== 'number')
    const useHeatmap    = numericCols.length >= 2 && labelCols.length >= 1

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

  return null
}

export default function DashboardPage() {
  const { user, setUser } = useAuth()
  const navigate          = useNavigate()
  const queryClient       = useQueryClient()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [elementType, setElementType] = useState<ElementType>('grafica')

  // React Query, un solo fetch, cacheado automáticamente

  const {
    data:    widgets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['myWidgets'],
    queryFn:  getMyWidgets,
    staleTime: 5 * 60 * 1000,   // 5 min
  })



  const handleLogout = async () => {
    await logout()
    setUser(null)
    queryClient.clear()   // limpia el caché de React Query al cerrar sesión
    navigate('/login', { replace: true })
  }

  // mas adelante: borrar widgets
  const handleDelete = async (id: string) => {
    await deleteWidget(id)
    // Actualiza el caché local sin refetch
    queryClient.setQueryData<WidgetDTO[]>(
      ['myWidgets'],
      prev => prev?.filter(w => w.id !== id)
    )
  }

  const handleFABGenerate = (type: ElementType) => {
    setElementType(type)
    setModalOpen(true)
  }

  const handleGenerate = (_payload: GeneratePayload) => {
    // mas adelante: POST /widgets
    // al guardar, invalidar el caché para refetch
    // queryClient.invalidateQueries({ queryKey: ['myWidgets'] })
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

        {/* Widgets */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {widgets.map(w => (
              <WidgetRenderer
                key={w.id}
                widget={w}
                onDelete={() => handleDelete(w.id)}
              />
            ))}
          </div>
        )}

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
