import { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'
import { geoBounds } from 'd3-geo'
import Card from '../../common/Card'
import { ISO_TO_INEGI } from './mexicoCodes'

const STATES_URL = '/data/mexico-states.json'
const MUNIS_URL  = (stateCode: number) =>
  `/data/municipalities/${String(stateCode).padStart(2, '0')}.json`

const MAP_WIDTH      = 800
const MAP_HEIGHT     = 500
const PROJ_SCALE     = 1100
const PROJ_CENTER: [number, number] = [-102, 23.5]
const MEX_LNG_SPAN   = 32
const MEX_LAT_SPAN   = 18
const MAX_STATE_ZOOM = 10

interface MapCardProps {
  title?:             string
  subtitle?:          string
  data:               Record<string, number>
  municipalityData?:  Record<string, number>
  valueLabel?:        string
  unit?:              string
  domain?:            [number, number]
  colorRange?:        [string, string]
  keyBy?:             'id' | 'name'
  formatValue?:       (n: number) => string
  className?:         string
}

interface HoverInfo {
  name:  string
  value: number | null
  x:     number
  y:     number
}

interface SelectedState {
  iso:    string
  name:   string
  inegi:  number
  center: [number, number]
  zoom:   number
}

export default function MapCard({
  title,
  subtitle,
  data,
  municipalityData,
  valueLabel = 'Prevalencia',
  unit = '%',
  domain,
  colorRange = ['#E8F7FA', '#1B3A6B'],
  keyBy = 'id',
  formatValue,
  className = '',
}: MapCardProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const [selected, setSelected] = useState<SelectedState | null>(null)

  const [min, max] = useMemo(() => {
    if (domain) return domain
    const src = municipalityData && selected ? municipalityData : data
    const values = Object.values(src).filter(v => Number.isFinite(v))
    if (values.length === 0) return [0, 1] as [number, number]
    return [Math.min(...values), Math.max(...values)] as [number, number]
  }, [data, municipalityData, selected, domain])

  const colorScale = useMemo(
    () => scaleLinear<string>().domain([min, max]).range(colorRange).clamp(true),
    [min, max, colorRange],
  )

  const format = formatValue ?? ((n: number) => `${n.toFixed(1)}${unit}`)

  const handleStateClick = (geo: any) => {
    const iso = geo.properties.id as string
    const name = geo.properties.name as string
    const inegi = ISO_TO_INEGI[iso]
    if (!inegi) return

    const [[x0, y0], [x1, y1]] = geoBounds(geo)
    const center: [number, number] = [(x0 + x1) / 2, (y0 + y1) / 2]
    const rawZoom = Math.min(
      (MEX_LNG_SPAN / Math.max(x1 - x0, 0.5)) * 0.85,
      (MEX_LAT_SPAN / Math.max(y1 - y0, 0.5)) * 0.85,
    )
    const zoom = Math.min(rawZoom, MAX_STATE_ZOOM)

    setHover(null)
    setSelected({ iso, name, inegi, center, zoom })
  }

  const handleBack = () => {
    setHover(null)
    setSelected(null)
  }

  const statesLayer = (
    <Geographies geography={STATES_URL}>
      {({ geographies }) =>
        geographies.map(geo => {
          const key = geo.properties[keyBy] as string
          const name = geo.properties.name as string
          const value = !selected ? data[key] : undefined
          const isDimmed = selected && selected.iso !== geo.properties.id
          const fill = selected
            ? (isDimmed ? 'var(--color-hi-bg)' : 'transparent')
            : (value != null && Number.isFinite(value)
                ? colorScale(value)
                : 'var(--color-hi-bg)')

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={fill}
              stroke="var(--color-hi-surface)"
              strokeWidth={selected ? 0.3 : 0.75}
              style={{
                default: { outline: 'none' },
                hover:   {
                  outline: 'none',
                  fill: selected ? fill : 'var(--color-hi-primary)',
                  cursor: selected ? 'default' : 'pointer',
                },
                pressed: { outline: 'none' },
              }}
              onClick={() => !selected && handleStateClick(geo)}
              onMouseEnter={e => {
                if (selected) return
                setHover({ name, value: value ?? null, x: e.clientX, y: e.clientY })
              }}
              onMouseMove={e =>
                setHover(prev =>
                  prev ? { ...prev, x: e.clientX, y: e.clientY } : prev,
                )
              }
              onMouseLeave={() => !selected && setHover(null)}
            />
          )
        })
      }
    </Geographies>
  )

  const munisLayer = selected && (
    <Geographies geography={MUNIS_URL(selected.inegi)}>
      {({ geographies }) =>
        geographies.map(geo => {
          const cvegeo = geo.properties.cvegeo as string
          const name = geo.properties.name as string
          const value = municipalityData?.[cvegeo]
          const fill =
            value != null && Number.isFinite(value)
              ? colorScale(value)
              : 'var(--color-hi-primary-soft)'

          return (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill={fill}
              stroke="var(--color-hi-surface)"
              strokeWidth={0.2}
              style={{
                default: { outline: 'none' },
                hover:   { outline: 'none', fill: 'var(--color-hi-primary)', cursor: 'pointer' },
                pressed: { outline: 'none' },
              }}
              onMouseEnter={e =>
                setHover({ name, value: value ?? null, x: e.clientX, y: e.clientY })
              }
              onMouseMove={e =>
                setHover(prev =>
                  prev ? { ...prev, x: e.clientX, y: e.clientY } : prev,
                )
              }
              onMouseLeave={() => setHover(null)}
            />
          )
        })
      }
    </Geographies>
  )

  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <div className="relative">
        {selected && (
          <button
            onClick={handleBack}
            className="absolute top-2 left-2 z-10 flex items-center gap-1.5
              px-3 py-1.5 rounded-[var(--radius-md)] cursor-pointer
              bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
              text-xs font-semibold text-[var(--color-hi-text-main)]
              hover:bg-[var(--color-hi-bg)] transition-colors shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Volver
          </button>
        )}

        {selected && (
          <div className="absolute top-2 right-2 z-10 px-3 py-1.5 rounded-[var(--radius-md)]
            bg-[var(--color-hi-primary-soft)] text-xs font-semibold text-[var(--color-hi-primary-dark)]">
            {selected.name}
          </div>
        )}

        <ComposableMap
          key={selected?.iso ?? 'root'}
          projection="geoMercator"
          projectionConfig={{ scale: PROJ_SCALE, center: PROJ_CENTER }}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{ width: '100%', height: 'auto' }}
        >
          {selected ? (
            <ZoomableGroup
              center={selected.center}
              zoom={selected.zoom}
              minZoom={1}
              maxZoom={MAX_STATE_ZOOM * 2}
            >
              {statesLayer}
              {munisLayer}
            </ZoomableGroup>
          ) : (
            statesLayer
          )}
        </ComposableMap>

        {hover && <MapTooltip hover={hover} label={valueLabel} format={format} />}
      </div>

      <Legend min={min} max={max} format={format} colorRange={colorRange} />
    </Card>
  )
}

function MapTooltip({
  hover,
  label,
  format,
}: {
  hover: HoverInfo
  label: string
  format: (n: number) => string
}) {
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-[var(--radius-md)]
        bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
        shadow-lg px-3 py-2 text-xs"
      style={{ left: hover.x + 12, top: hover.y + 12 }}
    >
      <div className="font-semibold text-[var(--color-hi-text-main)]">{hover.name}</div>
      <div className="text-[var(--color-hi-text-sub)]">
        {label}:{' '}
        <span className="font-semibold text-[var(--color-hi-navy)]">
          {hover.value != null ? format(hover.value) : 'Sin datos'}
        </span>
      </div>
    </div>
  )
}

function Legend({
  min,
  max,
  format,
  colorRange,
}: {
  min: number
  max: number
  format: (n: number) => string
  colorRange: [string, string]
}) {
  const gradient = `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})`

  return (
    <div className="mt-4 flex items-center gap-3">
      <span className="text-xs text-[var(--color-hi-text-sub)] min-w-10 text-right">
        {format(min)}
      </span>
      <div
        className="relative flex-1 h-2 rounded-full border border-[var(--color-hi-border)]"
        style={{ background: gradient }}
        aria-hidden="true"
      />
      <span className="text-xs text-[var(--color-hi-text-sub)] min-w-10">
        {format(max)}
      </span>
    </div>
  )
}
