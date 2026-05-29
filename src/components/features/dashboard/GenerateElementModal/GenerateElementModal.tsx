import { useState, useEffect } from 'react'
import Modal    from '../../../common/Modal/Modal'
import Button   from '../../../common/Button/Button'
import Dropdown from '../../../common/Dropdown/Dropdown'
import { getMetricasByDataset, getValoresDistintos, type MetricaOption } from '../../../../services/datasetService'
import {
  sanitizeFiltroVal,
  TIPO_SEMANTICO_LABEL,
  NIVEL_GEOGRAFICO_LABEL,
  type WidgetTipo,
  type QueryConfig,
  type QueryConfigStat,
  type QueryConfigSeries,
  type QueryConfigPie,
  type QueryConfigTable,
  type QueryConfigMultiseries,
  type TipoSemantico,
  type NivelGeografico,
} from '../../../../services/widgetService'
import type { ElementType } from '../FAB/FAB'

const TIPO_SEMANTICO_OPTS = (Object.keys(TIPO_SEMANTICO_LABEL) as TipoSemantico[])
  .map(v => ({ value: v, label: TIPO_SEMANTICO_LABEL[v] }))

const NIVEL_GEOGRAFICO_OPTS = (Object.keys(NIVEL_GEOGRAFICO_LABEL) as NivelGeografico[])
  .map(v => ({ value: v, label: NIVEL_GEOGRAFICO_LABEL[v] }))

// ── Tipos internos ─────────────────────────────────────────────────────────────

// Subtipos de widget que el usuario puede escoger dentro de cada ElementType
interface SubtipoOption {
  tipo:  WidgetTipo
  label: string
}

const SUBTIPOS_BY_ELEMENT: Record<ElementType, SubtipoOption[]> = {
  indicador: [{ tipo: 'STAT',        label: 'Card de indicador'   }],
  grafica:   [
    { tipo: 'LINE',        label: 'Líneas'              },
    { tipo: 'BAR',         label: 'Barras'              },
    { tipo: 'PIE',         label: 'Pastel'              },
    { tipo: 'MULTISERIES', label: 'Multiseries (líneas)'},
    { tipo: 'MULTIBAR',    label: 'Multiseries (barras)'},
  ],
  tabla:     [{ tipo: 'TABLE',       label: 'Tabla de datos'      }],
}

// Funciones de agregación disponibles
const FUNCIONES = [
  { value: 'MAX', label: 'Máximo (MAX)' },
  { value: 'MIN', label: 'Mínimo (MIN)' },
  { value: 'SUM', label: 'Suma (SUM)'   },
  { value: 'AVG', label: 'Promedio (AVG)' },
  { value: 'COUNT', label: 'Conteo (COUNT)' },
]

// ── Props ──────────────────────────────────────────────────────────────────────

export interface GenerateElementModalProps {
  isOpen:      boolean
  onClose:     () => void
  elementType: ElementType
  datasetId:   string
  nombreTabla: string             // nombre real de la tabla en BD
  currentWidgetCount: number
  onSaved:     () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Alias legible de la métrica (para mostrar en dropdowns)
const metricLabel = (m: MetricaOption) =>
  m.unidad ? `${m.nombre} (${m.unidad})` : m.nombre

// Construye el queryConfig según el tipo de widget
function buildQueryConfig(
  tipo:     WidgetTipo,
  tabla:    string,
  fields:   Record<string, string>,
): QueryConfig {
  const funcion = fields.funcion || 'MAX'

  switch (tipo) {

    case 'STAT': {
      const cfg: QueryConfigStat = {
        tabla,
        funcion,
        columna: fields.columna,
      }
      if (fields.filtroCol && fields.filtroVal) {
        cfg.filtroCol = fields.filtroCol
        cfg.filtroVal = sanitizeFiltroVal(fields.filtroVal)
      }
      return cfg
    }

    case 'LINE':
    case 'BAR': {
      const cfg: QueryConfigSeries = {
        tabla,
        colX:    fields.colX,
        colY:    fields.colY,
        funcion,
        groupBy: fields.colX,  // agrupar por el eje X es el caso natural
      }
      if (fields.filtroCol && fields.filtroVal) {
        cfg.filtroCol = fields.filtroCol
        cfg.filtroVal = sanitizeFiltroVal(fields.filtroVal)
      }
      return cfg
    }

    case 'PIE': {
      const cfg: QueryConfigPie = {
        tabla,
        colLabel: fields.colLabel,
        colValue: fields.colValue,
        funcion,
      }
      return cfg
    }

    case 'TABLE': {
      // columnas es una lista CSV de los columnaCsv seleccionados
      const columnas = fields.columnas || '*'
      const cfg: QueryConfigTable = {
        tabla,
        columnas,
        limite: 100,
      }
      return cfg
    }

    case 'MULTISERIES':
    case 'MULTIBAR': {
      const cfg: QueryConfigMultiseries = {
        tabla,
        colX:     fields.colX,
        colY:     fields.colY,
        colSerie: fields.colSerie,
        funcion,
      }
      if (fields.filtroCol && fields.filtroVal) {
        cfg.filtroCol = fields.filtroCol
        cfg.filtroVal = sanitizeFiltroVal(fields.filtroVal)
      }
      return cfg
    }

    default:
      // Fallback seguro
      return { tabla, funcion, columna: fields.columna } as QueryConfigStat
  }
}

// ── Componente ─────────────────────────────────────────────────────────────────

export default function GenerateElementModal({
  isOpen,
  onClose,
  elementType,
  datasetId,
  nombreTabla,
  currentWidgetCount,
  onSaved,
}: GenerateElementModalProps) {

  const subtiposDisponibles = SUBTIPOS_BY_ELEMENT[elementType]
  const autoTipo = subtiposDisponibles.length === 1 ? subtiposDisponibles[0].tipo : null

  // ── Estado del formulario ──────────────────────────────────────────────────

  const [titulo,  setTitulo]  = useState('')
  const [tipo,    setTipo]    = useState<WidgetTipo | ''>(autoTipo ?? '')
  const [fields,  setFields]  = useState<Record<string, string>>({ funcion: 'MAX' })

  // Sección de filtro opcional
  const [showFilter,  setShowFilter]  = useState(false)
  const [filtroCol,   setFiltroCol]   = useState('')
  const [filtroVal,   setFiltroVal]   = useState('')
  const [filtroValErr, setFiltroValErr] = useState('')

  // Valores distintos para el filtro inteligente
  const [valoresDistintos,        setValoresDistintos]        = useState<string[]>([])
  const [loadingValores,          setLoadingValores]          = useState(false)
  const [usarDropdownFiltro,      setUsarDropdownFiltro]      = useState(false)

  // Metadatos semánticos para que la IA interprete bien el widget
  const [tipoSemantico,   setTipoSemantico]   = useState<TipoSemantico   | ''>('')
  const [nivelGeografico, setNivelGeografico] = useState<NivelGeografico | ''>('')

  // Datos del backend
  const [metricas,        setMetricas]        = useState<MetricaOption[]>([])
  const [loadingMetricas, setLoadingMetricas] = useState(false)
  const [errorMetricas,   setErrorMetricas]   = useState<string | null>(null)

  // Estado de guardado
  const [saving, setSaving]   = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  // ── Efectos ────────────────────────────────────────────────────────────────

  // Carga métricas del dataset al abrir
  useEffect(() => {
    if (!isOpen || !datasetId) return
    setLoadingMetricas(true)
    setErrorMetricas(null)
    getMetricasByDataset(datasetId)
      .then(setMetricas)
      .catch(() => setErrorMetricas('No se pudieron cargar las columnas de este dataset.'))
      .finally(() => setLoadingMetricas(false))
  }, [isOpen, datasetId])

  // Resetea campos cuando cambia el tipo
  useEffect(() => {
    setFields({ funcion: 'MAX' })
    setFiltroCol('')
    setFiltroVal('')
    setShowFilter(false)
    setValoresDistintos([])
    setUsarDropdownFiltro(false)
  }, [tipo])

  // Carga valores distintos cuando el usuario elige una columna de filtro
  useEffect(() => {
    if (!filtroCol || !datasetId) {
      setValoresDistintos([])
      setUsarDropdownFiltro(false)
      setFiltroVal('')
      return
    }
    setLoadingValores(true)
    setFiltroVal('')
    getValoresDistintos(datasetId, filtroCol)
      .then(({ valores, total }) => {
        setValoresDistintos(valores)
        // Si el backend devolvió menos de 50 → los tenemos todos → dropdown
        // Si devolvió exactamente 50 → puede haber más → input libre con ejemplo
        setUsarDropdownFiltro(total < 50)
      })
      .catch(() => {
        // Si falla, caemos al input libre sin ejemplo
        setValoresDistintos([])
        setUsarDropdownFiltro(false)
      })
      .finally(() => setLoadingValores(false))
  }, [filtroCol, datasetId])

  // ── Helpers de columnas ────────────────────────────────────────────────────

  const colOpts = metricas.map(m => ({ value: m.columnaCsv, label: metricLabel(m) }))

  const setField = (key: string, val: string) =>
    setFields(prev => ({ ...prev, [key]: val }))

  // Validación del filtroVal: solo texto, números, punto, coma, espacio y guion
  const handleFiltroValChange = (raw: string) => {
    setFiltroVal(raw)
    if (/['";\-\-\/\*\\]/.test(raw)) {
      setFiltroValErr('Caracteres no permitidos: \' " ; - / * \\')
    } else {
      setFiltroValErr('')
    }
  }

  // ── Validación de completitud ──────────────────────────────────────────────

  const isComplete = (): boolean => {
    if (!titulo.trim() || !tipo) return false
    if (filtroValErr) return false
    switch (tipo) {
      case 'STAT':
        return !!fields.columna
      case 'LINE':
      case 'BAR':
        return !!fields.colX && !!fields.colY
      case 'PIE':
        return !!fields.colLabel && !!fields.colValue
      case 'TABLE':
        return !!fields.columnas
      case 'MULTISERIES':
      case 'MULTIBAR':
        return !!fields.colX && !!fields.colY && !!fields.colSerie
      default:
        return false
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!tipo || !isComplete()) return
    setSaving(true)
    setSaveErr(null)

    // Incluye filtros en fields si están activos
    const allFields: Record<string, string> = { ...fields }
    if (showFilter && filtroCol && filtroVal) {
      allFields.filtroCol = filtroCol
      allFields.filtroVal = filtroVal
    }

    try {
      // Importamos dinámicamente para no crear un ciclo en el archivo
      const { createWidget } = await import('../../../../services/widgetService')

      const queryConfig = buildQueryConfig(tipo, nombreTabla, allFields)

      await createWidget({
        titulo:           titulo.trim(),
        tipo,
        queryConfig,
        orden:            currentWidgetCount + 1,
        tipoSemantico:    tipoSemantico   || undefined,
        nivelGeografico:  nivelGeografico || undefined,
      })

      onSaved()
      handleClose()
    } catch {
      setSaveErr('No se pudo guardar el widget. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Reset al cerrar ────────────────────────────────────────────────────────

  const handleClose = () => {
    setTitulo('')
    setTipo(autoTipo ?? '')
    setFields({ funcion: 'MAX' })
    setFiltroCol('')
    setFiltroVal('')
    setFiltroValErr('')
    setShowFilter(false)
    setTipoSemantico('')
    setNivelGeografico('')
    setMetricas([])
    setSaveErr(null)
    onClose()
  }

  // ── Render de campos según tipo ────────────────────────────────────────────

  const renderFields = () => {
    if (loadingMetricas) return (
      <p className="text-xs text-[var(--color-hi-text-hint)]">Cargando columnas…</p>
    )
    if (errorMetricas) return (
      <p className="text-xs text-[var(--color-hi-danger)] px-1">{errorMetricas}</p>
    )

    switch (tipo) {

      case 'STAT':
        return (
          <>
            <Dropdown label="Columna (métrica)" placeholder="Selecciona una columna…"
              options={colOpts} value={fields.columna ?? ''}
              onChange={v => setField('columna', v)} />
            <Dropdown label="Función de agregación" options={FUNCIONES}
              value={fields.funcion} onChange={v => setField('funcion', v)} />
          </>
        )

      case 'LINE':
      case 'BAR':
        return (
          <>
            <Dropdown label="Eje X" placeholder="Categoría / tiempo…"
              options={colOpts} value={fields.colX ?? ''}
              onChange={v => setField('colX', v)} />
            <Dropdown label="Eje Y (valor)" placeholder="Métrica numérica…"
              options={colOpts} value={fields.colY ?? ''}
              onChange={v => setField('colY', v)} />
            <Dropdown label="Función de agregación" options={FUNCIONES}
              value={fields.funcion} onChange={v => setField('funcion', v)} />
          </>
        )

      case 'PIE':
        return (
          <>
            <Dropdown label="Categoría (etiqueta)" placeholder="Columna de categoría…"
              options={colOpts} value={fields.colLabel ?? ''}
              onChange={v => setField('colLabel', v)} />
            <Dropdown label="Valor" placeholder="Columna numérica…"
              options={colOpts} value={fields.colValue ?? ''}
              onChange={v => setField('colValue', v)} />
            <Dropdown label="Función de agregación" options={FUNCIONES}
              value={fields.funcion} onChange={v => setField('funcion', v)} />
          </>
        )

      case 'TABLE': {
        // Para TABLE el usuario selecciona múltiples columnas; las guardamos como CSV
        const selectedCols = fields.columnas ? fields.columnas.split(', ') : []
        const toggleCol = (colCsv: string) => {
          const next = selectedCols.includes(colCsv)
            ? selectedCols.filter(c => c !== colCsv)
            : [...selectedCols, colCsv]
          setField('columnas', next.join(', '))
        }
        return (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
              Columnas a mostrar
            </span>
            <div className="flex flex-wrap gap-2">
              {metricas.map(m => {
                const active = selectedCols.includes(m.columnaCsv)
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleCol(m.columnaCsv)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer
                      ${active
                        ? 'bg-[var(--color-hi-primary-soft)] border-[var(--color-hi-primary)] text-[var(--color-hi-primary-dark)] font-semibold'
                        : 'bg-[var(--color-hi-surface)] border-[var(--color-hi-border)] text-[var(--color-hi-text-sub)] hover:border-[var(--color-hi-primary)]'
                      }`}
                  >
                    {metricLabel(m)}
                  </button>
                )
              })}
            </div>
            {selectedCols.length === 0 && (
              <p className="text-xs text-[var(--color-hi-text-hint)]">
                Selecciona al menos una columna.
              </p>
            )}
          </div>
        )
      }

      case 'MULTISERIES':
      case 'MULTIBAR':
        return (
          <>
            <Dropdown label="Eje X" placeholder="Categoría / tiempo…"
              options={colOpts} value={fields.colX ?? ''}
              onChange={v => setField('colX', v)} />
            <Dropdown label="Eje Y (valor)" placeholder="Métrica numérica…"
              options={colOpts} value={fields.colY ?? ''}
              onChange={v => setField('colY', v)} />
            <Dropdown label="Serie (columna de agrupación)" placeholder="Columna que divide las series…"
              options={colOpts} value={fields.colSerie ?? ''}
              onChange={v => setField('colSerie', v)} />
            <Dropdown label="Función de agregación" options={FUNCIONES}
              value={fields.funcion} onChange={v => setField('funcion', v)} />
          </>
        )

      default:
        return null
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const TIPO_LABELS: Record<string, string> = {
    indicador: 'Indicador',
    grafica:   'Gráfica',
    tabla:     'Tabla',
  }

  const subtipoOpts = subtiposDisponibles.map(s => ({ value: s.tipo, label: s.label }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Nuevo ${TIPO_LABELS[elementType]}`}
      subtitle="Configura los parámetros del elemento"
      size="md"
    >
      <div className="flex flex-col gap-5">

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder={`Ej: ${TIPO_LABELS[elementType]} por estado`}
            className="
              w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
              border border-[var(--color-hi-border)]
              bg-[var(--color-hi-surface)]
              text-[var(--color-hi-text-main)]
              placeholder:text-[var(--color-hi-text-hint)]
              focus:outline-none focus:border-[var(--color-hi-border-focus)]
              focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
              transition-colors
            "
          />
        </div>

        {/* Subtipo — solo si hay más de uno */}
        {subtiposDisponibles.length > 1 && (
          <Dropdown
            label="Tipo de gráfica"
            placeholder="Selecciona un tipo…"
            options={subtipoOpts}
            value={tipo}
            onChange={val => setTipo(val as WidgetTipo)}
          />
        )}

        {/* Parámetros (aparecen cuando hay un tipo seleccionado) */}
        {tipo && (
          <section className="
            flex flex-col gap-3 p-4
            rounded-[var(--radius-md)]
            border border-[var(--color-hi-border)]
            bg-[var(--color-hi-bg)]
          ">
            <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
              Parámetros
            </span>
            {renderFields()}
          </section>
        )}

        {/* Filtro opcional */}
        {tipo && tipo !== 'PIE' && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { setShowFilter(v => !v); setFiltroCol(''); setFiltroVal(''); setValoresDistintos([]); setUsarDropdownFiltro(false) }}
              className="flex items-center gap-1.5 text-xs text-[var(--color-hi-primary)] hover:underline cursor-pointer w-fit"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {showFilter
                  ? <><line x1="4" y1="8" x2="12" y2="8" /></>
                  : <><line x1="8" y1="4" x2="8" y2="12" /><line x1="4" y1="8" x2="12" y2="8" /></>
                }
              </svg>
              {showFilter ? 'Quitar filtro' : '+ Agregar filtro'}
            </button>

            {showFilter && (
              <div className="
                flex flex-col gap-3 p-4
                rounded-[var(--radius-md)]
                border border-[var(--color-hi-border)]
                bg-[var(--color-hi-bg)]
              ">
                <span className="text-xs text-[var(--color-hi-text-hint)]">
                  El filtro restringe los datos por el valor exacto de una columna.
                </span>
                <Dropdown
                  label="Columna de filtro"
                  placeholder="Selecciona una columna…"
                  options={colOpts}
                  value={filtroCol}
                  onChange={setFiltroCol}
                />

                {filtroCol && (
                  loadingValores ? (
                    <p className="text-xs text-[var(--color-hi-text-hint)]">Cargando valores…</p>
                  ) : usarDropdownFiltro ? (
                    /* Dropdown — columna tiene menos de 50 valores distintos */
                    <Dropdown
                      label="Valor del filtro"
                      placeholder="Selecciona un valor…"
                      options={valoresDistintos.map(v => ({ value: v, label: v }))}
                      value={filtroVal}
                      onChange={setFiltroVal}
                    />
                  ) : (
                    /* Input libre — columna con muchos valores o numérica */
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
                        Valor del filtro
                      </label>
                      <input
                        type="text"
                        value={filtroVal}
                        onChange={e => handleFiltroValChange(e.target.value)}
                        placeholder={
                          valoresDistintos.length > 0
                            ? `Ej: "${valoresDistintos[0]}"`
                            : 'Ej: "2024", "Jalisco", "Both sexes"'
                        }
                        className={`
                          w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
                          border bg-[var(--color-hi-surface)]
                          text-[var(--color-hi-text-main)]
                          placeholder:text-[var(--color-hi-text-hint)]
                          focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
                          transition-colors
                          ${filtroValErr
                            ? 'border-[var(--color-hi-danger)] focus:border-[var(--color-hi-danger)]'
                            : 'border-[var(--color-hi-border)] focus:border-[var(--color-hi-border-focus)]'
                          }
                        `}
                      />
                      {filtroValErr && (
                        <p className="text-xs text-[var(--color-hi-danger)]">{filtroValErr}</p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Metadatos para la IA — opcional pero recomendado */}
        {tipo && (
          <section className="
            flex flex-col gap-3 p-4
            rounded-[var(--radius-md)]
            border border-dashed border-[var(--color-hi-border)]
            bg-[var(--color-hi-surface)]
          ">
            <div>
              <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
                Metadatos para IA <span className="text-[var(--color-hi-text-hint)] font-normal">(opcional)</span>
              </span>
              <p className="text-[11px] text-[var(--color-hi-text-hint)] mt-0.5 leading-snug">
                Si este widget se usa para generar estrategias de mercadotecnia, indica cómo
                debe interpretarse el número y a qué nivel geográfico corresponde.
              </p>
            </div>
            <Dropdown
              label="¿Qué representa el valor?"
              placeholder="Selecciona el tipo de métrica…"
              options={TIPO_SEMANTICO_OPTS}
              value={tipoSemantico}
              onChange={v => setTipoSemantico(v as TipoSemantico)}
            />
            <Dropdown
              label="Nivel geográfico"
              placeholder="Selecciona el nivel…"
              options={NIVEL_GEOGRAFICO_OPTS}
              value={nivelGeografico}
              onChange={v => setNivelGeografico(v as NivelGeografico)}
            />
          </section>
        )}

        {/* Error de guardado */}
        {saveErr && (
          <p className="text-xs text-[var(--color-hi-danger)] px-1">{saveErr}</p>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!isComplete() || saving}
          >
            Agregar al dashboard
          </Button>
        </div>

      </div>
    </Modal>
  )
}