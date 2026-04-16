import { useState, useEffect } from 'react'
import Modal    from '../../../common/Modal/Modal'
import Button   from '../../../common/Button/Button'
import Dropdown from '../../../common/Dropdown/Dropdown'

// ── Types ─────────────────────────────────────────────────────────────────────

/** Slot de parámetro que define un tipo de elemento (nombre semántico + key interno) */
interface ParamSlot {
  key:   string   // identificador interno, e.g. "eje_x"
  label: string   // etiqueta visible,      e.g. "Eje X"
}

/** Valor seleccionado para un slot */
interface ParamValue {
  slotKey: string   // referencia al ParamSlot.key
  column:  string   // columna del CSV elegida por el usuario
}

export interface GeneratePayload {
  dataSource: string
  chartType:  string
  params:     ParamValue[]
}

interface GenerateElementModalProps {
  isOpen:      boolean
  onClose:     () => void
  onGenerate?: (payload: GeneratePayload) => void
}

// ── Config estática ───────────────────────────────────────────────────────────
// En producción esto vendría del backend. Se mantiene aquí como mock.

const DATA_SOURCE_OPTIONS = [
  { value: 'ensanut_2022', label: 'ENSANUT 2022' },
  { value: 'ensanut_2018', label: 'ENSANUT 2018' },
  { value: 'inegi_2020',   label: 'INEGI 2020'   },
  { value: 'sinave_2023',  label: 'SINAVE 2023'  },
]

const CHART_TYPE_OPTIONS = [
  { value: 'card',       label: 'Card informativo' },
  { value: 'barras',     label: 'Barras'           },
  { value: 'lineas',     label: 'Líneas'           },
  { value: 'pastel',     label: 'Pastel'           },
  { value: 'dispersion', label: 'Dispersión'       },
  { value: 'tabla',      label: 'Tabla'            },
]

/**
 * Slots fijos por tipo de elemento.
 * Cada entrada define cuántos parámetros necesita y cómo se llaman semánticamente.
 */
const PARAM_SLOTS: Record<string, ParamSlot[]> = {
  card:       [{ key: 'metrica',   label: 'Métrica'   }],
  barras:     [{ key: 'eje_x',     label: 'Eje X'     },
               { key: 'eje_y',     label: 'Eje Y'     }],
  lineas:     [{ key: 'eje_x',     label: 'Eje X'     },
               { key: 'eje_y',     label: 'Eje Y'     }],
  pastel:     [{ key: 'categoria', label: 'Categoría' },
               { key: 'valor',     label: 'Valor'     }],
  dispersion: [{ key: 'eje_x',     label: 'Eje X'     },
               { key: 'eje_y',     label: 'Eje Y'     }],
  tabla:      [{ key: 'col_1',     label: 'Columna 1' },
               { key: 'col_2',     label: 'Columna 2' },
               { key: 'col_3',     label: 'Columna 3' }],
}

/**
 * Columnas disponibles por fuente de datos.
 * En producción se cargan del backend al seleccionar la fuente.
 */
const SOURCE_COLUMNS: Record<string, string[]> = {
  ensanut_2022: ['edad', 'sexo', 'estado', 'imc', 'glucosa', 'presion_sistolica', 'presion_diastolica', 'colesterol', 'anio'],
  ensanut_2018: ['edad', 'sexo', 'estado', 'imc', 'glucosa', 'presion_sistolica', 'anio'],
  inegi_2020:   ['entidad', 'municipio', 'poblacion', 'hombres', 'mujeres', 'edad_mediana', 'anio'],
  sinave_2023:  ['semana_epidemiologica', 'enfermedad', 'casos', 'defunciones', 'entidad', 'anio'],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const toOptions = (cols: string[]) => cols.map(c => ({ value: c, label: c }))

const emptyParams = (slots: ParamSlot[]): ParamValue[] =>
  slots.map(s => ({ slotKey: s.key, column: '' }))

// ── Component ─────────────────────────────────────────────────────────────────

export default function GenerateElementModal({
  isOpen,
  onClose,
  onGenerate,
}: GenerateElementModalProps) {

  const [dataSource,     setDataSource]     = useState('')
  const [chartType,      setChartType]      = useState('')
  const [params,         setParams]         = useState<ParamValue[]>([])
  const [previewReady,   setPreviewReady]   = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Re-inicializa slots cuando cambia el tipo de elemento
  useEffect(() => {
    if (!chartType) { setParams([]); return }
    setParams(emptyParams(PARAM_SLOTS[chartType] ?? []))
    setPreviewReady(false)
  }, [chartType])

  // Limpia selecciones de columnas cuando cambia la fuente
  useEffect(() => {
    setParams(prev => prev.map(p => ({ ...p, column: '' })))
    setPreviewReady(false)
  }, [dataSource])

  // ── Derived ───────────────────────────────────────────────────────────────

  const showParams = !!dataSource && !!chartType
  const slots      = chartType ? (PARAM_SLOTS[chartType] ?? []) : []
  const columnOpts = dataSource ? toOptions(SOURCE_COLUMNS[dataSource] ?? []) : []
  const allFilled  = showParams && params.length > 0 && params.every(p => p.column !== '')

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleParamChange = (slotKey: string, column: string) => {
    setParams(prev => prev.map(p => p.slotKey === slotKey ? { ...p, column } : p))
    setPreviewReady(false)
  }

  const handleDataSourceChange = (val: string) => {
    setDataSource(val)
    setChartType('')    // resetea tipo para evitar columnas inválidas
    setPreviewReady(false)
  }

  const handlePreview = async () => {
    setPreviewLoading(true)
    // TODO: reemplazar con llamada real al backend
    await new Promise(res => setTimeout(res, 900))
    setPreviewLoading(false)
    setPreviewReady(true)
  }

  const handleGenerate = () => {
    onGenerate?.({ dataSource, chartType, params })
    handleClose()
  }

  const handleClose = () => {
    setDataSource('')
    setChartType('')
    setParams([])
    setPreviewReady(false)
    onClose()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generar Elemento"
      size="md"
    >
      <div className="flex flex-col gap-5">

        {/* ── 1. Fuente de datos ──────────────────────────────────────────── */}
        <Dropdown
          label="Fuente de datos"
          placeholder="Selecciona una fuente…"
          options={DATA_SOURCE_OPTIONS}
          value={dataSource}
          onChange={handleDataSourceChange}
        />

        {/* ── 2. Tipo de elemento (habilitado solo si hay fuente) ──────────── */}
        <Dropdown
          label="Tipo de elemento"
          placeholder="Selecciona un tipo…"
          options={CHART_TYPE_OPTIONS}
          value={chartType}
          onChange={val => { setChartType(val); setPreviewReady(false) }}
          disabled={!dataSource}
        />

        {/* ── 3. Parámetros — aparece cuando ambos están seleccionados ─────── */}
        {showParams && (
          <section
            className="
              flex flex-col gap-3
              rounded-[var(--radius-md)]
              border border-[var(--color-hi-border)]
              bg-[var(--color-hi-bg)]
              p-4
            "
          >
            <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
              Parámetros
            </span>

            {slots.map(slot => {
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
            })}
          </section>
        )}

        {/* ── 4. Vista previa ─────────────────────────────────────────────── */}
        <section>
          <span className="block text-sm font-semibold text-[var(--color-hi-text-sub)] mb-2">
            Vista previa
          </span>

          <div
            className="
              min-h-[120px] flex items-center justify-center
              rounded-[var(--radius-md)]
              border border-dashed border-[var(--color-hi-border)]
              bg-[var(--color-hi-bg)]
            "
          >
            {previewLoading ? (
              <div className="flex flex-col items-center gap-2">
                <svg
                  className="animate-spin w-6 h-6 text-[var(--color-hi-primary)]"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                <span className="text-xs text-[var(--color-hi-text-hint)]">
                  Generando vista previa…
                </span>
              </div>
            ) : previewReady ? (
              <PreviewPlaceholder chartType={chartType} />
            ) : (
              <p className="text-sm text-[var(--color-hi-text-hint)]">
                El elemento generado se mostrará aquí
              </p>
            )}
          </div>
        </section>

        {/* ── Acciones ────────────────────────────────────────────────────── */}
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
            Generar
          </Button>
        </div>

      </div>
    </Modal>
  )
}

// ── PreviewPlaceholder ────────────────────────────────────────────────────────
// Mock visual — reemplazar con la librería de charts real.

function PreviewPlaceholder({ chartType }: { chartType: string }) {
  const bars = [55, 80, 45, 90, 65, 70]

  if (chartType === 'card') {
    return (
      <div className="flex flex-col items-center gap-1 py-4">
        <span className="text-3xl font-bold text-[var(--color-hi-primary)]">84.2%</span>
        <span className="text-xs text-[var(--color-hi-text-hint)]">Métrica seleccionada</span>
      </div>
    )
  }

  if (chartType === 'barras') {
    return (
      <div className="flex items-end gap-2 px-6 py-4 h-[110px] w-full">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-[var(--color-hi-primary)] opacity-80"
            style={{ height: `${h}%` }} />
        ))}
      </div>
    )
  }

  if (chartType === 'lineas') {
    const pts = bars.map((h, i) => `${i * 40 + 20},${110 - h}`).join(' ')
    return (
      <svg viewBox="0 0 240 120" className="w-full px-4" aria-hidden="true">
        <polyline points={pts} fill="none"
          stroke="var(--color-hi-primary)" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    )
  }

  if (chartType === 'pastel') {
    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-hi-primary)"
          strokeWidth="20" strokeDasharray="125 251" strokeDashoffset="0" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-hi-navy)"
          strokeWidth="20" strokeDasharray="75 251" strokeDashoffset="-125" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-hi-primary-soft)"
          strokeWidth="20" strokeDasharray="51 251" strokeDashoffset="-200" />
      </svg>
    )
  }

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

  // Dispersión
  const points = [[30,80],[60,40],[90,65],[50,25],[120,55],[80,90],[140,35],[110,75]]
  return (
    <svg viewBox="0 0 180 110" className="w-full px-4" aria-hidden="true">
      {points.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="var(--color-hi-primary)" opacity="0.75" />
      ))}
    </svg>
  )
}