import Modal from '../../../common/Modal/Modal'
import Badge from '../../../common/Badge/Badge'
import {
  ESTADO_LABEL,
  type MarketingStrategyDTO,
  type EstadoStrategy,
} from '../../../../types/MarketingStrategy'

const ESTADO_VARIANT: Record<EstadoStrategy, 'neutral' | 'success' | 'danger'> = {
  propuesta:  'neutral',
  ejecutada:  'success',
  descartada: 'danger',
}

interface StrategyHistoryModalProps {
  isOpen:        boolean
  onClose:       () => void
  strategies:    MarketingStrategyDTO[]
  currentId?:    string
  onSelect:      (id: string) => void
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('es-MX', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit',
    })
  } catch {
    return iso
  }
}

const truncate = (s: string, n: number) =>
  s.length <= n ? s : s.slice(0, n - 1) + '…'

export default function StrategyHistoryModal({
  isOpen, onClose, strategies, currentId, onSelect,
}: StrategyHistoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de estrategias"
      subtitle={`${strategies.length} estrategia${strategies.length === 1 ? '' : 's'} generada${strategies.length === 1 ? '' : 's'}`}
      size="lg"
    >
      {strategies.length === 0 ? (
        <p className="text-sm text-[var(--color-hi-text-sub)] py-8 text-center">
          Aún no has generado estrategias.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 list-none p-0 m-0 max-h-64 overflow-y-auto">
          {strategies.map(s => {
            const isCurrent = s.id === currentId
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => { onSelect(s.id); onClose() }}
                  className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-colors cursor-pointer
                    ${isCurrent
                      ? 'border-[var(--color-hi-primary)] bg-[var(--color-hi-primary-soft)]'
                      : 'border-[var(--color-hi-border)] bg-[var(--color-hi-surface)] hover:bg-[var(--color-hi-bg)]'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[var(--color-hi-text-sub)]">{formatDate(s.creadoEn)}</p>
                    <Badge
                      label={ESTADO_LABEL[s.estado]}
                      variant={ESTADO_VARIANT[s.estado]}
                    />
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-hi-text-main)] leading-snug">
                    {truncate(s.payload?.resumen_ejecutivo ?? '', 140)}
                  </p>
                  {s.comentarios?.length > 0 && (
                    <p className="mt-1 text-[10px] text-[var(--color-hi-text-hint)]">
                      {s.comentarios.length} comentario{s.comentarios.length === 1 ? '' : 's'}
                    </p>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
