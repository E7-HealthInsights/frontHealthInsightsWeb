import { useState, useEffect } from 'react'
import Modal    from '../../../common/Modal/Modal'
import Button   from '../../../common/Button/Button'
import Dropdown from '../../../common/Dropdown/Dropdown'
import { getDatasets, getMetricasByDataset } from '../../../../services/datasetService'
import type { DatasetOption, MetricaOption } from '../../../../services/datasetService'
import type { ElementType, ChartSubtype, ParamValue, GeneratePayload } from '../../../../types/Widget'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ParamSlot {
  key:   string
  label: string
}

interface GenerateElementModalProps {
  isOpen:      boolean
  onClose:     () => void
  elementType: ElementType
  onGenerate:  (payload: GeneratePayload) => void
}

// ── Config estática ───────────────────────────────────────────────────────────

const CHART_OPTIONS_BY_TYPE: Record<ElementType, { value: ChartSubtype; label: string }[]> = {
  indicador: [{ value: 'card',       label: 'Card informativo' }],
  grafica:   [
    { value: 'barras',     label: 'Barras'     },
    { value: 'lineas',     label: 'Líneas'     },
    { value: 'pastel',     label: 'Pastel'     },
    { value: 'dispersion', label: 'Dispersión' },
  ],
  tabla:     [{ value: 'tabla', label: 'Tabla de datos'  }],
  mapa:      [{ value: 'card', label: 'Mapa coroplético' }],
}

const PARAM_SLOTS: Record<ChartSubtype, ParamSlot[]> = {
  card:       [{ key: 'metrica',   label: 'Métrica'   }],
  barras:     [{ key: 'eje_x',     label: 'Eje X'     }, { key: 'eje_y',  label: 'Eje Y'  }],
  lineas:     [{ key: 'eje_x',     label: 'Eje X'     }, { key: 'eje_y',  label: 'Eje Y'  }],
  pastel:     [{ key: 'categoria', label: 'Categoría' }, { key: 'valor',  label: 'Valor'  }],
  dispersion: [{ key: 'eje_x',     label: 'Eje X'     }, { key: 'eje_y',  label: 'Eje Y'  }],
  tabla:      [
    { key: 'col_1', label: 'Columna 1' },
    { key: 'col_2', label: 'Columna 2' },
    { key: 'col_3', label: 'Columna 3' },
  ],
}

const ELEMENT_LABELS: Record<ElementType, string> = {
  indicador: 'Indicador',
  grafica:   'Gráfica',
  mapa:      'Mapa',
  tabla:     'Tabla',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const emptyParams = (slots: ParamSlot[]): ParamValue[] =>
  slots.map(s => ({ slotKey: s.key, column: '' }))

// Convierte MetricaOption[] al formato { value, label } que espera Dropdown
const metricasToOptions = (metricas: MetricaOption[]) =>
  metricas.map(m => ({
    value: m.columnaCsv,
    label: m.unidad ? `${m.nombre} (${m.unidad})` : m.nombre,
  }))

// ── Component ─────────────────────────────────────────────────────────────────

export default function GenerateElementModal({
  isOpen,
  onClose,
  elementType,
  onGenerate,
}: GenerateElementModalProps) {

  const chartOptions = CHART_OPTIONS_BY_TYPE[elementType]
  const autoType     = chartOptions.length === 1 ? chartOptions[0].value : ''

  // Form state
  const [dataSource,     setDataSource]     = useState('')
  const [chartType,      setChartType]      = useState<ChartSubtype | ''>(autoType)
  const [title,          setTitle]          = useState('')
  const [params,         setParams]         = useState<ParamValue[]>([])
  const [previewReady,   setPreviewReady]   = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Datos del backend
  const [datasets,        setDatasets]        = useState<DatasetOption[]>([])
  const [metricas,        setMetricas]        = useState<MetricaOption[]>([])
  const [loadingDatasets, setLoadingDatasets] = useState(false)
  const [loadingMetricas, setLoadingMetricas] = useState(false)
  const [errorDatasets,   setErrorDatasets]   = useState<string | null>(null)
  const [errorMetricas,   setErrorMetricas]   = useState<string | null>(null)

  // ── Efectos ────────────────────────────────────────────────────────────────

  // Carga los datasets al abrir el modal
  useEffect(() => {
    if (!isOpen) return
    setChartType(autoType)
    setLoadingDatasets(true)
    setErrorDatasets(null)
    getDatasets()
      .then(setDatasets)
      .catch(() => setErrorDatasets('No se pudieron cargar las fuentes de datos.'))
      .finally(() => setLoadingDatasets(false))
  }, [isOpen, autoType])

  // Carga las métricas cuando el usuario elige una fuente
  useEffect(() => {
    if (!dataSource) { setMetricas([]); return }
    setLoadingMetricas(true)
    setErrorMetricas(null)
    setParams([])
    setPreviewReady(false)
    getMetricasByDataset(dataSource)
      .then(setMetricas)
      .catch(() => setErrorMetricas('No se pudieron cargar las columnas de este dataset.'))
      .finally(() => setLoadingMetricas(false))
  }, [dataSource])

  // Reinicia parámetros cuando cambia el subtipo
  useEffect(() => {
    if (!chartType) { setParams([]); return }
    setParams(emptyParams(PARAM_SLOTS[chartType]))
    setPreviewReady(false)
  }, [chartType])

  // ── Derived ───────────────────────────────────────────────────────────────

  const showSubtype  = chartOptions.length > 1
  const showParams   = !!dataSource && !!chartType && metricas.length > 0
  const slots        = chartType ? PARAM_SLOTS[chartType] : []
  const columnOpts   = metricasToOptions(metricas)
  const datasetOpts  = datasets.map(d => ({ value: d.id, label: d.nombre }))
  const allFilled    = showParams
    && params.length > 0
    && params.every(p => p.column !== '')
    && title.trim() !== ''

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleParamChange = (slotKey: string, column: string) => {
    setParams(prev => prev.map(p => p.slotKey === slotKey ? { ...p, column } : p))
    setPreviewReady(false)
  }

  const handlePreview = async () => {
    setPreviewLoading(true)
    // TODO Bloque 3: llamar a GET /datasets/{id}/data con los params para traer datos reales
    await new Promise(res => setTimeout(res, 800))
    setPreviewLoading(false)
    setPreviewReady(true)
  }

  const handleGenerate = () => {
    if (!chartType) return
    onGenerate({ dataSource, chartType, params, title: title.trim() })
    handleClose()
  }

  const handleClose = () => {
    setDataSource('')
    setChartType(autoType)
    setTitle('')
    setParams([])
    setMetricas([])
    setPreviewReady(false)
    setErrorDatasets(null)
    setErrorMetricas(null)
    onClose()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Nuevo ${ELEMENT_LABELS[elementType]}`}
      subtitle="Configura los parámetros del elemento"
      size="md"
    >
      <div className="flex flex-col gap-5">

        {/* Título del widget */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-hi-text-sub)]">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Ej: ${ELEMENT_LABELS[elementType]} por estado`}
            className="
              w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
              border border-[var(--color-hi-border)]
              bg-[var(--color-hi-surface)]
              text-[var(--color-hi-text-main)]
              placeholder:text-[var(--color-hi-text-hint)]
              focus:outline-none focus:border-[var(--color-hi-border-focus)]
              transition-colors
            "
          />
        </div>

        {/* 1. Fuente de datos */}
        {errorDatasets ? (
          <InlineError message={errorDatasets} />
        ) : (
          <Dropdown
            label="Fuente de datos"
            placeholder={loadingDatasets ? 'Cargando fuentes…' : 'Selecciona una fuente…'}
            options={datasetOpts}
            value={dataSource}
            onChange={val => { setDataSource(val); setPreviewReady(false) }}
            disabled={loadingDatasets}
          />
        )}

        {/* 2. Subtipo de gráfica — solo si hay más de una opción */}
        {showSubtype && (
          <Dropdown
            label="Tipo de gráfica"
            placeholder="Selecciona un tipo…"
            options={chartOptions}
            value={chartType}
            onChange={val => { setChartType(val as ChartSubtype); setPreviewReady(false) }}
            disabled={!dataSource || loadingDatasets}
          />
        )}

        {/* 3. Parámetros */}
        {!!dataSource && !!chartType && (
          <section className="
            flex flex-col gap-3 p-4
            rounded-[var(--radius-md)]
            border border-[var(--color-hi-border)]
            bg-[var(--color-hi-bg)]
          ">
            <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
              Parámetros
            </span>

            {loadingMetricas ? (
              <p className="text-xs text-[var(--color-hi-text-hint)]">Cargando columnas…</p>
            ) : errorMetricas ? (
              <InlineError message={errorMetricas} />
            ) : (
              slots.map(slot => {
                const current = params.find(p => p.slotKey === slot.key)?.column ?? ''
                return (
                  <Dropdown
                    key={slot.key}
                    label={slot.label}
                    placeholder="Selecciona una columna…"
                    options={columnOpts}
                    value={current}
                    onChange={val => handleParamChange(slot.key, val)}
                  />
                )
              })
            )}
          </section>
        )}

        {/* 4. Vista previa */}
        <section>
          <span className="block text-sm font-semibold text-[var(--color-hi-text-sub)] mb-2">
            Vista previa
          </span>
          <div className="
            min-h-[120px] flex items-center justify-center
            rounded-[var(--radius-md)]
            border border-dashed border-[var(--color-hi-border)]
            bg-[var(--color-hi-bg)]
          ">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin w-6 h-6 text-[var(--color-hi-primary)]"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span className="text-xs text-[var(--color-hi-text-hint)]">
                  Generando vista previa…
                </span>
              </div>
            ) : previewReady ? (
              <PreviewPlaceholder chartType={chartType as ChartSubtype} />
            ) : (
              <p className="text-sm text-[var(--color-hi-text-hint)]">
                Completa los parámetros y presiona Preview
              </p>
            )}
          </div>
        </section>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handlePreview}
            loading={previewLoading}
            disabled={!allFilled}
          >
            Preview
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!previewReady}
          >
            Agregar al dashboard
          </Button>
        </div>

      </div>
    </Modal>
  )
}

// ── InlineError ───────────────────────────────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <p className="text-xs text-[var(--color-hi-danger)] px-1">{message}</p>
  )
}

// ── PreviewPlaceholder ────────────────────────────────────────────────────────

function PreviewPlaceholder({ chartType }: { chartType: ChartSubtype }) {
  const bars = [55, 80, 45, 90, 65, 70]

  if (chartType === 'card') return (
    <div className="flex flex-col items-center gap-1 py-4">
      <span className="text-3xl font-bold text-[var(--color-hi-primary)]">84.2%</span>
      <span className="text-xs text-[var(--color-hi-text-hint)]">Métrica seleccionada</span>
    </div>
  )

  if (chartType === 'barras') return (
    <div className="flex items-end gap-2 px-6 py-4 h-[110px] w-full">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-t-sm bg-[var(--color-hi-primary)] opacity-80"
          style={{ height: `${h}%` }} />
      ))}
    </div>
  )

  if (chartType === 'lineas') {
    const pts = bars.map((h, i) => `${i * 40 + 20},${110 - h}`).join(' ')
    return (
      <svg viewBox="0 0 240 120" className="w-full px-4" aria-hidden="true">
        <polyline points={pts} fill="none"
          stroke="var(--color-hi-primary)" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    )
  }

  if (chartType === 'pastel') return (
    <svg viewBox="0 0 100 100" className="w-24 h-24" aria-hidden="true">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-hi-primary)"
        strokeWidth="20" strokeDasharray="125 251" strokeDashoffset="0" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#1B3A6B"
        strokeWidth="20" strokeDasharray="75 251" strokeDashoffset="-125" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#E8F7FA"
        strokeWidth="20" strokeDasharray="51 251" strokeDashoffset="-200" />
    </svg>
  )

  if (chartType === 'tabla') {
    const rows = [['Jalisco', '142', '3.2%'], ['CDMX', '310', '7.1%'], ['Tabasco', '88', '2.0%']]
    return (
      <div className="w-full px-4 py-2">
        <table className="w-full text-xs text-left border-collapse">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-[var(--color-hi-surface)]' : ''}>
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-1 border border-[var(--color-hi-border)] text-[var(--color-hi-text-sub)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const pts = [[30,80],[60,40],[90,65],[50,25],[120,55],[80,90],[140,35],[110,75]]
  return (
    <svg viewBox="0 0 180 110" className="w-full px-4" aria-hidden="true">
      {pts.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="var(--color-hi-primary)" opacity="0.75" />
      ))}
    </svg>
  )
}