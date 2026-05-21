import { useState } from 'react'
import Modal  from '../../../common/Modal/Modal'
import Button from '../../../common/Button/Button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmActionModalProps {
  isOpen:      boolean
  onClose:     () => void
  /** Describe la acción: 'eliminar el usuario "Carlos Méndez"' */
  accionLabel: string
  /** Callback al confirmar — recibe la justificación ingresada */
  onConfirm:   (justification: string) => void | Promise<void>
  /** Carga mientras se procesa la acción */
  loading?:    boolean
}

type Step = 'confirm' | 'justify'

// ─── Component ───────────────────────────────────────────────────────────────

export default function ConfirmActionModal({
  isOpen,
  onClose,
  accionLabel,
  onConfirm,
  loading = false,
}: ConfirmActionModalProps) {
  const [step, setStep]                   = useState<Step>('confirm')
  const [justification, setJustification] = useState('')
  const [error, setError]                 = useState('')

  const handleClose = () => {
    setStep('confirm')
    setJustification('')
    setError('')
    onClose()
  }

  const handleConfirmar = async () => {
    if (!justification.trim()) {
      setError('La justificación es obligatoria.')
      return
    }
    await onConfirm(justification.trim())
    handleClose()
  }

  // ── Step 1: Confirmación ──────────────────────────────────────────────────

  const ConfirmStep = () => (
    <>
      <div className="flex justify-center mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
        >
          <svg
            width="28" height="28" viewBox="0 0 28 28" fill="none"
            stroke="var(--color-hi-warning)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M12.1 4.2L2.5 20a2 2 0 001.7 3h19.6a2 2 0 001.7-3L15.9 4.2a2 2 0 00-3.8 0z" />
            <line x1="14" y1="11" x2="14" y2="16" />
            <circle cx="14" cy="20" r="1" fill="var(--color-hi-warning)" stroke="none" />
          </svg>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--color-hi-text-sub)] mb-1">
        Estás a punto de
      </p>
      <p className="text-center font-semibold text-[var(--color-hi-navy)] mb-4">
        {accionLabel}
      </p>
      <p className="text-center text-xs text-[var(--color-hi-text-hint)] mb-6">
        Esta acción quedará registrada en la bitácora. ¿Deseas continuar?
      </p>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => setStep('justify')}>
          Continuar
        </Button>
      </div>
    </>
  )

  // ── Step 2: Justificación ─────────────────────────────────────────────────

  const JustifyStep = () => (
    <>
      <p className="text-sm text-[var(--color-hi-text-sub)] mb-4">
        Ingresa una justificación para dejar registro en la bitácora.
        Este campo es obligatorio.
      </p>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5">
          Justificación
        </label>
        <textarea
          rows={3}
          value={justification}
          onChange={e => {
            setJustification(e.target.value)
            if (e.target.value.trim()) setError('')
          }}
          placeholder="Ej: Solicitud aprobada por director de área."
          className={`
            w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
            border transition-colors resize-none
            text-[var(--color-hi-text-main)]
            placeholder:text-[var(--color-hi-text-hint)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/30
            ${error
              ? 'border-[var(--color-hi-danger)] bg-red-50'
              : 'border-[var(--color-hi-border)] bg-[var(--color-hi-surface)] focus:border-[var(--color-hi-border-focus)]'
            }
          `}
        />
        {error && (
          <p className="mt-1 text-xs text-[var(--color-hi-danger)]">{error}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setStep('confirm')}>
          Atrás
        </Button>
        <Button variant="primary" onClick={handleConfirmar} loading={loading}>
          Confirmar
        </Button>
      </div>
    </>
  )

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'confirm' ? '¿Confirmar acción?' : 'Ingresa una justificación'}
      subtitle={step === 'justify' ? accionLabel : undefined}
      size="sm"
    >
      {step === 'confirm' ? (
        <>
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
            >
              <svg
                width="28" height="28" viewBox="0 0 28 28" fill="none"
                stroke="var(--color-hi-warning)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M12.1 4.2L2.5 20a2 2 0 001.7 3h19.6a2 2 0 001.7-3L15.9 4.2a2 2 0 00-3.8 0z" />
                <line x1="14" y1="11" x2="14" y2="16" />
                <circle cx="14" cy="20" r="1" fill="var(--color-hi-warning)" stroke="none" />
              </svg>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--color-hi-text-sub)] mb-1">
            Estás a punto de
          </p>
          <p className="text-center font-semibold text-[var(--color-hi-navy)] mb-4">
            {accionLabel}
          </p>
          <p className="text-center text-xs text-[var(--color-hi-text-hint)] mb-6">
            Esta acción quedará registrada en la bitácora. ¿Deseas continuar?
          </p>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setStep('justify')}>
              Continuar
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--color-hi-text-sub)] mb-4">
            Ingresa una justificación para dejar registro en la bitácora.
            Este campo es obligatorio.
          </p>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5">
              Justificación
            </label>
            <textarea
              rows={3}
              value={justificacion}
              onChange={e => {
                setJustificacion(e.target.value)
                if (e.target.value.trim()) setError('')
              }}
              placeholder="Ej: Solicitud aprobada por director de área."
              className={`
                w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
                border transition-colors resize-none
                text-[var(--color-hi-text-main)]
                placeholder:text-[var(--color-hi-text-hint)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/30
                ${error
                  ? 'border-[var(--color-hi-danger)] bg-red-50'
                  : 'border-[var(--color-hi-border)] bg-[var(--color-hi-surface)] focus:border-[var(--color-hi-border-focus)]'
                }
              `}
            />
            {error && (
              <p className="mt-1 text-xs text-[var(--color-hi-danger)]">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStep('confirm')}>
              Atrás
            </Button>
            <Button variant="primary" onClick={handleConfirmar} loading={loading}>
              Confirmar
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
