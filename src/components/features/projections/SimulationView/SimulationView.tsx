import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import Card     from '../../../common/Card'
import Button   from '../../../common/Button'
import Dropdown from '../../../common/Dropdown'

export interface KeyResult {
  label: string
  value: string
}

export interface SimulationParameter {
  label: string
  value: string
}

export interface AxisOption {
  value: string
  label: string
}

export interface SimulationViewProps {
  // Header
  title:    string
  subtitle: string
  onBack:   () => void
  onEdit:   () => void

  // Chart
  chartTitle:        string
  chartSubtitle?:    string
  chartData:         Record<string, string | number>[]
  xKey:              string
  baselineKey:       string   // línea punteada gris
  interventionKey:   string   // línea sólida teal
  baselineLabel:     string
  interventionLabel: string
  yAxisLabel?:       string

  // Variables
  xAxisOptions:    AxisOption[]
  yAxisOptions:    AxisOption[]
  selectedXAxis:   string
  selectedYAxis:   string
  onXAxisChange:   (value: string) => void
  onYAxisChange:   (value: string) => void

  // Parámetros y resultados
  parameters: SimulationParameter[]
  keyResults: KeyResult[]

  // Acciones
  onGenerateReport: () => void
  className?: string
}

// Tooltip custom alineado al design system
function ChartTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: { name: string; value: number; color: string }[]
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
      rounded-[var(--radius-md)] p-3 shadow-lg text-sm">
      {label && (
        <p className="font-semibold text-[var(--color-hi-text-main)] mb-1">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function SimulationView({
  title, subtitle, onBack, onEdit,
  chartTitle, chartSubtitle,
  chartData, xKey, baselineKey, interventionKey, baselineLabel, interventionLabel, yAxisLabel,
  xAxisOptions, yAxisOptions, selectedXAxis, selectedYAxis, onXAxisChange, onYAxisChange,
  parameters, keyResults,
  onGenerateReport,
  className = '',
}: SimulationViewProps) {
  return (
    <div className={`flex flex-col gap-6 p-6 bg-[var(--color-hi-bg)] min-h-screen ${className}`}>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <Button variant="secondary" size="sm" onClick={onBack} className="w-fit">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">{title}</h1>
            <p className="mt-1 text-sm text-[var(--color-hi-text-sub)]">{subtitle}</p>
          </div>
          <Button variant="icon" ariaLabel="Editar escenario" onClick={onEdit}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Contenido: 2 columnas */}
      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">

        {/* Columna izquierda: gráfica + resultados clave */}
        <Card title={chartTitle} subtitle={chartSubtitle}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-hi-border)"
                vertical={false}
              />
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                axisLine={false}
                tickLine={false}
                label={yAxisLabel ? {
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: -4,
                  style: { fontSize: 11, fill: 'var(--color-hi-text-sub)' },
                } : undefined}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="plainline"
              />
              <Line
                dataKey={baselineKey}
                name={baselineLabel}
                stroke="var(--color-hi-text-hint)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{ r: 5 }}
              />
              <Line
                dataKey={interventionKey}
                name={interventionLabel}
                stroke="var(--color-hi-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Resultados Clave */}
          <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-hi-bg)]
            border border-[var(--color-hi-border)] p-4">
            <p className="text-sm font-semibold text-[var(--color-hi-text-main)] mb-3">
              Resultados Clave
            </p>
            <div className="grid grid-cols-3 gap-4">
              {keyResults.map((result, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--color-hi-text-sub)]">{result.label}</span>
                  <span className="text-xl font-bold text-[var(--color-hi-navy)]">{result.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Columna derecha: variables + parámetros + botón */}
        <div className="flex flex-col gap-4">

          {/* Variables */}
          <div className="bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)]
            border border-[var(--color-hi-border)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-hi-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
              </svg>
              <h3 className="text-sm font-semibold text-[var(--color-hi-text-main)]">Variables</h3>
            </div>
            <div className="flex flex-col gap-4">
              <Dropdown
                label="Eje X"
                options={xAxisOptions}
                value={selectedXAxis}
                onChange={onXAxisChange}
              />
              <Dropdown
                label="Eje Y"
                options={yAxisOptions}
                value={selectedYAxis}
                onChange={onYAxisChange}
              />
            </div>
          </div>

          {/* Parámetros Usados */}
          <Card title="Parámetros Usados">
            <div className="flex flex-col gap-3">
              {parameters.map((param, i) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <span className="text-xs text-[var(--color-hi-text-sub)]">{param.label}</span>
                  <span className="text-sm font-medium text-[var(--color-hi-text-main)]">{param.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Botón Generar Reporte */}
          <Button variant="primary" size="md" className="w-full" onClick={onGenerateReport}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Generar Reporte
          </Button>

        </div>
      </div>
    </div>
  )
}
