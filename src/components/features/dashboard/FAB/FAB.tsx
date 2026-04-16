import { useState } from 'react'
import Modal from '../../../common/Modal'

type ElementType = 'indicador' | 'grafica' | 'mapa' | 'tabla'

interface ElementOption {
  type:        ElementType
  label:       string
  description: string
  icon:        React.ReactNode
}

interface FABProps {
  onGenerate: (type: ElementType) => void
  className?: string
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
    type:        'mapa',
    label:       'Mapa',
    description: 'Distribución geográfica por estado',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9"  y1="3"  x2="9"  y2="18" />
        <line x1="15" y1="6"  x2="15" y2="21" />
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

export type { ElementType }

export default function FAB({ onGenerate, className = '' }: FABProps) {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [selected,    setSelected]    = useState<ElementType | null>(null)

  function handleSelect(type: ElementType) {
    setSelected(type)
  }

  function handleConfirm() {
    if (!selected) return
    onGenerate(selected)
    setModalOpen(false)
    setSelected(null)
  }

  function handleClose() {
    setModalOpen(false)
    setSelected(null)
  }

  return (
    <>
      {/* Floating Action Button */}
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
        subtitle="Selecciona el tipo de elemento a agregar al dashboard"
        size="md"
      >
        <div className="grid grid-cols-2 gap-3 mb-6">
          {elementOptions.map(opt => (
            <button
              key={opt.type}
              type="button"
              onClick={() => handleSelect(opt.type)}
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

        <div className="flex justify-end gap-3">
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
            disabled={!selected}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)]
              bg-[var(--color-hi-primary)] text-white
              hover:bg-[var(--color-hi-primary-dark)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors cursor-pointer"
          >
            Generar
          </button>
        </div>
      </Modal>
    </>
  )
}
