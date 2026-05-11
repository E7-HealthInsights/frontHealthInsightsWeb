import { useMemo } from 'react'
import { scaleLinear } from 'd3-scale'
import Card from '../../../../common/Card/Card'

type CardAction = {
  label:   string
  onClick: () => void
  danger?: boolean
}

export interface HeatmapCardProps {
  title:        string
  subtitle?:    string
  rowKey:       string          // columna que va como label de fila (ej. 'municipio')
  valueColumns: string[]        // columnas numéricas a colorear
  rows:         Record<string, string | number | null>[]
  columnLabels?: Record<string, string>  // opcional, rótulo legible por columna
  colorRange?:  [string, string]
  height?:      number
  actions?:     CardAction[]
  className?:   string
}

// Tokens del sistema: hi-primary-soft → hi-navy (definidos en src/index.css)
const DEFAULT_RANGE: [string, string] = ['#E8F7FA', '#1B3A6B']

const formatColumnLabel = (raw: string) =>
  raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function HeatmapCard({
  title,
  subtitle,
  rowKey,
  valueColumns,
  rows,
  columnLabels,
  colorRange = DEFAULT_RANGE,
  actions = [],
  className = '',
}: HeatmapCardProps) {
  const { colorFor, min, max } = useMemo(() => {
    const values = rows.flatMap(row =>
      valueColumns
        .map(col => row[col])
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
    )
    if (values.length === 0) {
      return { colorFor: () => colorRange[0], min: 0, max: 0 }
    }
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const scale = scaleLinear<string>().domain([minV, maxV]).range(colorRange)
    return {
      colorFor: (v: number) => scale(v),
      min: minV,
      max: maxV,
    }
  }, [rows, valueColumns, colorRange])

  return (
    <Card title={title} subtitle={subtitle} actions={actions} className={className}>
      <div className="w-full overflow-x-auto pt-2">
        <table className="w-full text-xs border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th
                className="text-left text-[var(--color-hi-text-sub)] font-semibold pr-3 align-bottom"
                style={{ height: 150 }}
              >
                {formatColumnLabel(rowKey)}
              </th>
              {valueColumns.map(col => (
                <th
                  key={col}
                  className="text-[var(--color-hi-text-sub)] font-semibold align-bottom px-1"
                  style={{ height: 150, verticalAlign: 'bottom', minWidth: 90 }}
                  title={col}
                >
                  <div
                    className="inline-block whitespace-nowrap"
                    style={{
                      transform: 'rotate(-40deg) translateY(-4px)',
                      transformOrigin: 'left bottom',
                    }}
                  >
                    {columnLabels?.[col] ?? formatColumnLabel(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={String(row[rowKey] ?? i)}>
                <td className="text-[var(--color-hi-text-main)] font-medium pr-3 py-1 whitespace-nowrap">
                  {String(row[rowKey] ?? '—')}
                </td>
                {valueColumns.map(col => {
                  const raw = row[col]
                  const num = typeof raw === 'number' ? raw : null
                  const bg = num !== null ? colorFor(num) : 'transparent'
                  const isDark = num !== null && (num - min) / Math.max(max - min, 1e-9) > 0.55
                  return (
                    <td
                      key={col}
                      className="text-center px-2 py-1 rounded-[var(--radius-sm)] font-medium"
                      style={{
                        backgroundColor: bg,
                        color: isDark ? '#FFFFFF' : 'var(--color-hi-text-main)',
                        minWidth: 56,
                      }}
                      title={`${row[rowKey]} · ${columnLabels?.[col] ?? col}: ${num ?? '—'}`}
                    >
                      {num !== null ? num.toFixed(2) : '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--color-hi-text-sub)]">
        <span>{min.toFixed(2)}</span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{
            background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})`,
          }}
        />
        <span>{max.toFixed(2)}</span>
      </div>
    </Card>
  )
}
