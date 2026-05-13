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

  
  // Reservas fijas para que NUNCA se solapen ejes, ticks rotados, label de eje
  // y leyenda. Recharts respeta estas dimensiones al calcular el área del plot.
  const X_AXIS_HEIGHT = 72         // altura para ticks rotados
  const Y_AXIS_WIDTH  = 56         // ancho para ticks numéricos
  const X_LABEL_OFFSET = 24        // espacio extra abajo cuando hay xAxisLabel
  const LEGEND_HEIGHT_PER_ROW = 22 // altura aproximada por fila de leyenda
  const LEGEND_PADDING_TOP = 4
  // Estimar nº de filas que ocupa la leyenda según promedio chars/serie.
  const estimateLegendRows = (series: ChartSeries[]) => {
    if (series.length <= 1) return 0
    const avg = series.reduce((s, x) => s + x.name.length, 0) / series.length
    if (avg > 22) return 3
    if (avg > 12) return 2
    return 1
  }

  function BarChartView({ data, series, xKey, height, xAxisLabel, yAxisLabel }: {
    data: ChartDataPoint[]; series: ChartSeries[]; xKey: string; height: number; xAxisLabel?: string; yAxisLabel?: string
  }) {
    const legendRows   = estimateLegendRows(series)
    const legendHeight = legendRows * LEGEND_HEIGHT_PER_ROW + LEGEND_PADDING_TOP
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top:    legendRows > 0 ? legendHeight + 8 : 16,
            right:  16,
            left:   yAxisLabel ? 16 : 0,
            bottom: xAxisLabel ? X_LABEL_OFFSET : 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hi-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
            tickMargin={10}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={X_AXIS_HEIGHT}
            axisLine={false} tickLine={false}
            label={xAxisLabel
              ? { value: xAxisLabel, position: 'insideBottom', offset: -8, style: AXIS_LABEL_STYLE }
              : undefined}
          />
          <YAxis
            width={Y_AXIS_WIDTH}
            tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
            axisLine={false} tickLine={false}
            label={yAxisLabel
              ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }
              : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          {legendRows > 0 && (
            <Legend
              verticalAlign="top"
              align="center"
              height={legendHeight}
              wrapperStyle={{ fontSize: 11, paddingBottom: 4, lineHeight: '20px' }}
              iconSize={10}
            />
          )}
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
    const legendRows   = estimateLegendRows(series)
    const legendHeight = legendRows * LEGEND_HEIGHT_PER_ROW + LEGEND_PADDING_TOP
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top:    legendRows > 0 ? legendHeight + 8 : 16,
            right:  16,
            left:   yAxisLabel ? 16 : 0,
            bottom: xAxisLabel ? X_LABEL_OFFSET : 8,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hi-border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
            tickMargin={10}
            interval={0}
            angle={-35}
            textAnchor="end"
            height={X_AXIS_HEIGHT}    // ← usa la misma constante que Bar
            axisLine={false} tickLine={false}
            label={xAxisLabel
              ? { value: xAxisLabel, position: 'insideBottom', offset: -8, style: AXIS_LABEL_STYLE }
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
          {legendRows > 0 && (
            <Legend
              verticalAlign="top"
              align="center"
              height={legendHeight}
              wrapperStyle={{ fontSize: 11, paddingBottom: 4, lineHeight: '20px' }}
              iconSize={10}
            />
          )}
          {series.map((s, i) => (
            <Line key={s.dataKey} dataKey={s.dataKey} name={s.name}
              stroke={color(s, i)} strokeWidth={2}
              dot={{ r: 3, fill: color(s, i) }}
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