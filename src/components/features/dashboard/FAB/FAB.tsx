import { useState, useEffect } from 'react'
import Modal from '../../../common/Modal'
import Dropdown from '../../../common/Dropdown/Dropdown'
import { getDatasets, type DatasetOption } from '../../../../services/datasetService'
import type { WidgetTipo } from '../../../../services/widgetService'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type ElementType = 'indicador' | 'grafica' | 'tabla'

// Mapping de ElementType → tipos de widget que produce
export const ELEMENT_TO_TIPOS: Record<ElementType, WidgetTipo[]> = {
  indicador: ['STAT'],
  grafica:   ['LINE', 'BAR', 'PIE', 'MULTISERIES', 'MULTIBAR'],
  tabla:     ['TABLE'],
}

export interface FABSelection {
  elementType: ElementType
  datasetId:   string
  nombreTabla: string   // nombre real de la tabla, resuelto desde DatasetOption
}

interface FABProps {
  onGenerate: (selection: FABSelection) => void
  className?: string
}

// ── Opciones de tipo de elemento ──────────────────────────────────────────────

interface ElementOption {
  type:        ElementType
  label:       string
  description: string
  icon:        React.ReactNode
}

const elementOptions: ElementOption[] = [
  {
    type:        'indicador',
    label:       'Indicador',
    description: 'KPI numérico destacado',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="7"  width="4" height="14" rx="1" />
        <rect x="17" y="3"  width="4" height="18" rx="1" />
      </svg>
    ),
  },
  {
    type:        'grafica',
    label:       'Gráfica',
    description: 'Visualización de tendencias',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="3 17 9 11 13 15 21 7" />
        <polyline points="17 7 21 7 21 11" />
      </svg>
    ),
  },
  {
    type:        'tabla',
    label:       'Tabla',
    description: 'Datos tabulares con filtros',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3"  y1="9"  x2="21" y2="9"  />
        <line x1="3"  y1="15" x2="21" y2="15" />
        <line x1="9"  y1="3"  x2="9"  y2="21" />
      </svg>
    ),
  },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function FAB({ onGenerate, className = '' }: FABProps) {
  const [modalOpen, setModalOpen] = useState(false)

  // Paso 1: fuente de datos
  const [datasets,        setDatasets]        = useState<DatasetOption[]>([])
  const [loadingDatasets, setLoadingDatasets] = useState(false)
  const [errorDatasets,   setErrorDatasets]   = useState<string | null>(null)
  const [datasetId,       setDatasetId]       = useState('')

  // Paso 2: tipo de elemento
  const [selected, setSelected] = useState<ElementType | null>(null)

  // ── Carga de datasets al abrir ───────────────────────────────────────────

  useEffect(() => {
    if (!modalOpen) return
    setLoadingDatasets(true)
    setErrorDatasets(null)
    getDatasets()
      .then(setDatasets)
      .catch(() => setErrorDatasets('No se pudieron cargar las fuentes de datos.'))
      .finally(() => setLoadingDatasets(false))
  }, [modalOpen])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (!selected || !datasetId) return
    const dataset = datasets.find(d => d.id === datasetId)
    if (!dataset) return
    onGenerate({ elementType: selected, datasetId, nombreTabla: dataset.nombreTabla })
    handleClose()
  }

  const handleClose = () => {
    setModalOpen(false)
    setDatasetId('')
    setSelected(null)
    setErrorDatasets(null)
  }

  const datasetOpts = datasets.map(d => ({ value: d.id, label: d.nombre }))
  const canConfirm  = !!datasetId && !!selected

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        aria-label="Generar elemento"
        onClick={() => setModalOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-[var(--color-hi-primary)] hover:bg-[var(--color-hi-primary-dark)]
          text-white shadow-lg
          flex items-center justify-center
          transition-colors cursor-pointer
          ${className}
        `}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5"  y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modal de selección */}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title="Generar elemento"
        subtitle="Elige la fuente de datos y el tipo de elemento"
        size="md"
      >
        <div className="flex flex-col gap-5">

          {/* Paso 1: fuente de datos */}
          {errorDatasets ? (
            <p className="text-xs text-[var(--color-hi-danger)] px-1">{errorDatasets}</p>
          ) : (
            <Dropdown
              label="Fuente de datos"
              placeholder={loadingDatasets ? 'Cargando fuentes…' : 'Selecciona una fuente…'}
              options={datasetOpts}
              value={datasetId}
              onChange={val => { setDatasetId(val); setSelected(null) }}
              disabled={loadingDatasets}
            />
          )}

          {/* Paso 2: tipo de elemento — visible solo si hay fuente */}
          {datasetId && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[var(--color-hi-text-sub)]">
                Tipo de elemento
              </span>
              <div className="grid grid-cols-3 gap-3">
                {elementOptions.map(opt => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelected(opt.type)}
                    className={`
                      flex flex-col items-center gap-2 p-4
                      rounded-[var(--radius-md)] border text-center
                      transition-colors cursor-pointer
                      ${selected === opt.type
                        ? 'border-[var(--color-hi-primary)] bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-primary)]'
                        : 'border-[var(--color-hi-border)] bg-[var(--color-hi-surface)] text-[var(--color-hi-text-sub)] hover:bg-[var(--color-hi-bg)] hover:border-[var(--color-hi-primary)]'
                      }
                    `}
                  >
                    <span className={selected === opt.type
                      ? 'text-[var(--color-hi-primary)]'
                      : 'text-[var(--color-hi-text-hint)]'
                    }>
                      {opt.icon}
                    </span>
                    <span className={`text-sm font-semibold ${selected === opt.type
                      ? 'text-[var(--color-hi-primary)]'
                      : 'text-[var(--color-hi-text-main)]'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-[var(--color-hi-text-sub)]">
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]
                bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]
                text-[var(--color-hi-text-main)] hover:bg-[var(--color-hi-bg)]
                transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]
                bg-[var(--color-hi-primary)] text-white
                hover:bg-[var(--color-hi-primary-dark)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors cursor-pointer"
            >
              Continuar
            </button>
          </div>

        </div>
      </Modal>
    </>
  )
}