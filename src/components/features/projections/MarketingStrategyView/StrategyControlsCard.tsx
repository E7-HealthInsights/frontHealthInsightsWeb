import { useEffect, useState } from 'react'
import Card   from '../../../common/Card/Card'
import Badge  from '../../../common/Badge/Badge'
import Button from '../../../common/Button/Button'
import {
  ESTADO_LABEL,
  type MarketingStrategyDTO,
  type EstadoStrategy,
  type ComentarioDTO,
} from '../../../../types/MarketingStrategy'

const ESTADO_OPTS: EstadoStrategy[] = ['propuesta', 'ejecutada', 'descartada']

const ESTADO_VARIANT: Record<EstadoStrategy, 'neutral' | 'success' | 'danger'> = {
  propuesta:  'neutral',
  ejecutada:  'success',
  descartada: 'danger',
}

const ESTADO_HELP: Record<EstadoStrategy, string> = {
  propuesta:  'La estrategia está propuesta pero aún no se ha ejecutado.',
  ejecutada:  'Esta estrategia se ejecutó. Captura la nota de resultado para alimentar la siguiente generación.',
  descartada: 'Esta estrategia se descartó. La IA evitará repetir sus tácticas en futuras generaciones.',
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

interface StrategyControlsCardProps {
  strategy:           MarketingStrategyDTO
  onUpdateState:      (estado: EstadoStrategy, notaResultado: string) => Promise<void>
  onAddComment:       (contenido: string) => Promise<void>
  isUpdatingState?:   boolean
  isAddingComment?:   boolean
  errorState?:        string | null
  errorComment?:      string | null
}

export default function StrategyControlsCard({
  strategy,
  onUpdateState,
  onAddComment,
  isUpdatingState = false,
  isAddingComment = false,
  errorState  = null,
  errorComment = null,
}: StrategyControlsCardProps) {

  const [estadoSel,    setEstadoSel]    = useState<EstadoStrategy>(strategy.estado)
  const [nota,         setNota]         = useState<string>(strategy.notaResultado ?? '')
  const [commentDraft, setCommentDraft] = useState<string>('')

  useEffect(() => {
    setEstadoSel(strategy.estado)
    setNota(strategy.notaResultado ?? '')
    setCommentDraft('')
  }, [strategy.id, strategy.estado, strategy.notaResultado])

  const stateChanged =
    estadoSel !== strategy.estado ||
    (nota.trim() !== (strategy.notaResultado ?? '').trim())

  const handleSaveState = async () => {
    if (!stateChanged) return
    await onUpdateState(estadoSel, nota.trim())
  }

  const handleAddComment = async () => {
    const c = commentDraft.trim()
    if (!c) return
    await onAddComment(c)
    setCommentDraft('')
  }

  const comentarios: ComentarioDTO[] = strategy.comentarios ?? []

  return (
    <Card
      title="Seguimiento y comentarios"
      subtitle="Marca si esta estrategia se ejecutó y deja contexto para la siguiente generación"
      className="md:col-span-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Bloque estado ───────────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
              Estado actual:
            </span>
            <Badge
              label={ESTADO_LABEL[strategy.estado]}
              variant={ESTADO_VARIANT[strategy.estado]}
            />
            {strategy.fechaRevision && (
              <span className="text-[10px] text-[var(--color-hi-text-hint)]">
                · revisada {formatDate(strategy.fechaRevision)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
              Cambiar estado
            </label>
            <div className="flex flex-wrap gap-2">
              {ESTADO_OPTS.map(opt => {
                const active = estadoSel === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setEstadoSel(opt)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer
                      ${active
                        ? 'bg-[var(--color-hi-primary-soft)] border-[var(--color-hi-primary)] text-[var(--color-hi-primary-dark)] font-semibold'
                        : 'bg-[var(--color-hi-surface)] border-[var(--color-hi-border)] text-[var(--color-hi-text-sub)] hover:border-[var(--color-hi-primary)]'
                      }`}
                  >
                    {ESTADO_LABEL[opt]}
                  </button>
                )
              })}
            </div>
            <p className="text-[11px] text-[var(--color-hi-text-hint)]">
              {ESTADO_HELP[estadoSel]}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
              Nota de resultado <span className="text-[var(--color-hi-text-hint)] font-normal">(opcional)</span>
            </label>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Ej.: La campaña de espectaculares en Iztapalapa superó la meta. SMS no funcionó."
              rows={3}
              className="
                w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
                border border-[var(--color-hi-border)]
                bg-[var(--color-hi-surface)]
                text-[var(--color-hi-text-main)]
                placeholder:text-[var(--color-hi-text-hint)]
                focus:outline-none focus:border-[var(--color-hi-border-focus)]
                focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
                transition-colors resize-y
              "
            />
          </div>

          {errorState && (
            <p className="text-xs text-[var(--color-hi-danger)]">{errorState}</p>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              loading={isUpdatingState}
              disabled={!stateChanged || isUpdatingState}
              onClick={handleSaveState}
            >
              Guardar cambios
            </Button>
          </div>
        </section>

        {/* ── Bloque comentarios ──────────────────────────────────────── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
              Comentarios
            </span>
            <span className="text-[10px] text-[var(--color-hi-text-hint)]">
              {comentarios.length} en total
            </span>
          </div>

          <ul className="flex flex-col gap-2 list-none p-0 m-0 max-h-56 overflow-y-auto pr-1">
            {comentarios.length === 0 ? (
              <li className="text-[11px] text-[var(--color-hi-text-hint)] italic">
                Aún no hay comentarios. Lo que escribas aquí se incorporará al prompt de la próxima estrategia.
              </li>
            ) : (
              comentarios.map(c => (
                <li
                  key={c.id}
                  className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)]"
                >
                  <p className="text-xs text-[var(--color-hi-text-main)] leading-snug whitespace-pre-wrap">
                    {c.contenido}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--color-hi-text-hint)]">
                    {formatDate(c.creadoEn)}
                  </p>
                </li>
              ))
            )}
          </ul>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
              Agregar comentario
            </label>
            <textarea
              value={commentDraft}
              onChange={e => setCommentDraft(e.target.value)}
              placeholder="Ej.: El segmento de adultos mayores respondió mejor que el de jóvenes."
              rows={2}
              maxLength={2000}
              className="
                w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
                border border-[var(--color-hi-border)]
                bg-[var(--color-hi-surface)]
                text-[var(--color-hi-text-main)]
                placeholder:text-[var(--color-hi-text-hint)]
                focus:outline-none focus:border-[var(--color-hi-border-focus)]
                focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
                transition-colors resize-y
              "
            />
            {errorComment && (
              <p className="text-xs text-[var(--color-hi-danger)]">{errorComment}</p>
            )}
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                loading={isAddingComment}
                disabled={!commentDraft.trim() || isAddingComment}
                onClick={handleAddComment}
              >
                Agregar
              </Button>
            </div>
          </div>
        </section>

      </div>
    </Card>
  )
}
