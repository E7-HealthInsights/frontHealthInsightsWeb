import { useState } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { logout }              from '../services/authService'


import Navbar               from '../components/common/Navbar'
import StatCard             from '../components/features/dashboard/CardElements/StatCard/StatCard'
import ChartCard            from '../components/features/dashboard/CardElements/ChartCard/ChartCard'
import FAB                  from '../components/features/dashboard/FAB/FAB'
import GenerateElementModal from '../components/features/dashboard/GenerateElementModal/GenerateElementModal'
import type { ElementType, GeneratePayload } from '../types/Widget'
import { getMyWidgets, isChartData, isErrorData, isHeatmapData, isMultiSeriesData, isStatData, type ChartWidgetData, type StatWidgetData, type WidgetDTO } from '../services/widgetService'
import HeatmapCard from '../components/features/dashboard/CardElements/HeatmapCard/HeatmapCard'
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
 
  // STAT 
  if (widget.tipo === 'STAT' && isStatData(widget.data)) {
    return (
      <StatCard
        title={widget.titulo}
        subtitle={widget.subtitulo ?? ''}   
        value={widget.data.value.toLocaleString('es-MX')}
        label={(widget.data as StatWidgetData).label ?? 'Sin unidad'}  // unidad - bug de nacho
      />
    )
  }
 
  // LINE / BAR / PIE 
  if (isChartData(widget.data)) {
    const chartData = widget.data as ChartWidgetData
 
    // Transforma {labels[], values[]} → [{label, value}] para Recharts
    const rechartData = chartData.labels.map((lbl, i) => ({
      label: String(lbl),
      value: parseFloat(String(chartData.values[i] ?? '0')),
    }))
    console.log("mis labels"+ widget.xAxisLabel)
    console.log("mis labels"+ widget.yAxisLabel)
 
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
      />
    )
  }

  if ((widget.tipo === 'MULTISERIES' || widget.tipo === 'MULTIBAR') && isMultiSeriesData(widget.data)) {
    const multiData = widget.data
    const parsedData = multiData.data.map(row =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => [k, k === 'label' ? v : parseFloat(String(v))])
      )
    )

    return (
      <ChartCard
        title={widget.titulo}
        subtitle={widget.subtitulo}
        tipo={widget.tipo === 'MULTIBAR' ? 'bar' : 'line'}
        data={parsedData}
        height={280}
        xKey="label"
        xAxisLabel={widget.xAxisLabel}
        yAxisLabel={widget.yAxisLabel}
        series={multiData.seriesKeys.map((key) => ({
          dataKey: key,
          name:    key,
        }))}
        actions={actions}
      />
    )
  }

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

    const years = [...yearSet].sort()
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