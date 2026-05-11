import {
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  import Card from "../../../../common/Card/Card"
  import type { ChartType } from '../../../../../types/ChartType'
  
  
  // Cada objeto del array de datos que llega del backend
  export type ChartDataPoint = Record<string, string | number>
  
  // Qué campo mapea a qué eje / serie
  export type ChartSeries = {
    dataKey:  string   // key del objeto de datos  
    name:     string   // etiqueta en la leyenda    
    color?:   string   // color hex, opcional       
  }
  
  export type CardAction = {
    label:   string
    onClick: () => void
    danger?: boolean
  }
  
  interface ChartCardProps {
    title:       string
    subtitle?:   string
    tipo:        ChartType
    data:        ChartDataPoint[]
    series:      ChartSeries[]     // qué series/keys graficar
    xKey:        string            // key que va en el eje X   ej: 'trimestre'
    height?:     number            // altura del chart, default 220
    actions?:    CardAction[]
    className?:  string
    xAxisLabel?: string   
    yAxisLabel?: string    
  }
  
  
  const DEFAULT_COLORS = [
    '#38BDD1',  // hi-primary teal
    '#1B3A6B',  // hi-navy
    '#64748B',  // hi-text-sub
    '#22C55E',  // verde
    '#F59E0B',  // amarrillo
  ]
  
  const color = (series: ChartSeries, index: number) =>
    series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  
  
  const CustomTooltip = ({ active, payload, label }: {
    active?:  boolean
    payload?: { name: string; value: number; color: string }[]
    label?:   string
  }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
        rounded-[var(--radius-md)] p-3 shadow-lg text-sm">
        {label && (
          <p className="font-semibold text-[var(--color-hi-text-main)] mb-1">{label}</p>
        )}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: <span className="font-medium">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    )
  }
  
  const AXIS_LABEL_STYLE = { fontSize: 11, fill: 'var(--color-hi-text-sub)' }

  
  function BarChartView({ data, series, xKey, height, xAxisLabel, yAxisLabel }: {
    data: ChartDataPoint[]; series: ChartSeries[]; xKey: string; height: number; xAxisLabel?: string; yAxisLabel?: string
  }) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: yAxisLabel ? 16 : -16, bottom: xAxisLabel ? 28 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hi-border)" vertical={false} />
          <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
          axisLine={false} tickLine={false}
          label={xAxisLabel
            ? { value: xAxisLabel, position: 'insideBottom', offset: -12, style: AXIS_LABEL_STYLE }
            : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
          domain={['auto', 'auto']}
          axisLine={false} tickLine={false}
          tickCount={8}
          label={yAxisLabel
            ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10, style: AXIS_LABEL_STYLE }
            : undefined}
        />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
          {series.map((s, i) => (
            <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name}
              fill={color(s, i)} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    )
  }
  
  function LineChartView({ data, series, xKey, height, xAxisLabel, yAxisLabel }: {
    data: ChartDataPoint[]; series: ChartSeries[]; xKey: string; height: number; xAxisLabel?: string; yAxisLabel?: string
  }) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 16, right: 8, left: yAxisLabel ? 16 : -16, bottom: xAxisLabel ? 28 : 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hi-border)" vertical={false} />
          <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
          axisLine={false} tickLine={false}
          label={xAxisLabel
            ? { value: xAxisLabel, position: 'insideBottom', offset: -12, style: AXIS_LABEL_STYLE }
            : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
          scale="log"
          domain={['auto', 'auto']}
          axisLine={false} tickLine={false}
          tickCount={8}
          label={yAxisLabel
            ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 10, style: AXIS_LABEL_STYLE }
            : undefined}
        />
          <Tooltip content={<CustomTooltip />} />
          {series.length > 1 && <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} />}
          {series.map((s, i) => (
            <Line key={s.dataKey} dataKey={s.dataKey} name={s.name}
              stroke={color(s, i)} strokeWidth={2}
              dot={{ r: 4, fill: color(s, i) }}
              activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }
  
  
  const renderPieLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name,
  }: {
    cx: number; cy: number; midAngle: number
    innerRadius: number; outerRadius: number; percent: number; name: string
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    if (percent < 0.06) return null   // no muestra etiqueta si la rebanada es muy chica
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={500}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  
  function PieChartView({ data, series, height }: {
    data: ChartDataPoint[]; series: ChartSeries[]; height: number
  }) {
    
    const valueKey = series[0]?.dataKey ?? 'value'
  
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={height / 2 -60}
            outerRadius={height / 2 - 20}
            labelLine={false}
            label={renderPieLabel}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }
  
  
  export default function ChartCard({
    title,
    subtitle,
    tipo,
    data,
    series,
    xKey,
    xAxisLabel,
    yAxisLabel,
    height = 220,
    actions = [],
    className = '',
  }: ChartCardProps) {
    const renderChart = () => {
      switch (tipo) {
        case 'bar':  return <BarChartView  data={data} series={series} xKey={xKey} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} height={height} />
        case 'line': return <LineChartView data={data} series={series} xKey={xKey} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} height={height} />
        case 'pie':  return <PieChartView  data={data} series={series} height={height} />
        default:     return (
          <div className="flex items-center justify-center h-32
            text-sm text-[var(--color-hi-text-hint)]">
            Tipo de gráfica no soportado: {tipo}
          </div>
        )
      }
    }
  
    return (
      <Card title={title} subtitle={subtitle} actions={actions} className={className}>
        {renderChart()}
      </Card>
    )
  }