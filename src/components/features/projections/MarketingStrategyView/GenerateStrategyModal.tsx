import { useState } from 'react'
import Modal      from '../../../common/Modal/Modal'
import InputField from '../../../common/InputField/InputField'
import Dropdown   from '../../../common/Dropdown/Dropdown'
import Button     from '../../../common/Button/Button'
import type {
  GenerateStrategyInput,
  ChannelTipo,
  Tono,
} from '../../../../types/MarketingStrategy'
import { CHANNEL_LABEL, CHANNEL_DESCRIPTION, TONO_LABEL, CHANNEL_ORDER } from './labels'

interface GenerateStrategyModalProps {
  isOpen:   boolean
  onClose:  () => void
  onSubmit: (input: GenerateStrategyInput) => void
  loading?: boolean
}

const HORIZONTE_OPTIONS = [
  { value: '3',  label: '3 meses'  },
  { value: '6',  label: '6 meses'  },
  { value: '12', label: '12 meses' },
]

const TONO_OPTIONS = (Object.entries(TONO_LABEL) as [Tono, string][])
  .map(([value, label]) => ({ value, label }))

const splitCsv = (s: string): string[] =>
  s.split(',').map(x => x.trim()).filter(x => x.length > 0)

const parseNumber = (s: string): number | undefined => {
  const trimmed = s.trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export default function GenerateStrategyModal({
  isOpen, onClose, onSubmit, loading = false,
}: GenerateStrategyModalProps) {
  const [zonasFoco,    setZonasFoco]    = useState('')
  const [zonasExcluir, setZonasExcluir] = useState('')
  const [edadMin,      setEdadMin]      = useState('')
  const [edadMax,      setEdadMax]      = useState('')
  const [presupuesto,  setPresupuesto]  = useState('')
  const [medios,       setMedios]       = useState<ChannelTipo[]>([])
  const [horizonte,    setHorizonte]    = useState('')
  const [tono,         setTono]         = useState('')
  const [contexto,     setContexto]     = useState('')
  const [error,        setError]        = useState('')

  const toggleMedio = (m: ChannelTipo) => {
    setMedios(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  const reset = () => {
    setZonasFoco(''); setZonasExcluir('')
    setEdadMin(''); setEdadMax('')
    setPresupuesto(''); setMedios([])
    setHorizonte(''); setTono(''); setContexto('')
    setError('')
  }

  const handleClose = () => {
    if (loading) return
    reset()
    onClose()
  }

  const handleSubmit = () => {
    const eMin = parseNumber(edadMin)
    const eMax = parseNumber(edadMax)
    if (eMin !== undefined && eMax !== undefined && eMin > eMax) {
      setError('La edad mínima no puede ser mayor que la máxima.')
      return
    }
    setError('')

    const input: GenerateStrategyInput = {}
    const zf = splitCsv(zonasFoco);     if (zf.length) input.zonasFoco = zf
    const zx = splitCsv(zonasExcluir);  if (zx.length) input.zonasExcluir = zx
    if (eMin !== undefined) input.edadMin = eMin
    if (eMax !== undefined) input.edadMax = eMax
    const pres = parseNumber(presupuesto); if (pres !== undefined) input.presupuestoMxn = pres
    if (medios.length)   input.mediosPreferidos = medios
    if (horizonte)       input.horizonteMeses   = Number(horizonte) as 3 | 6 | 12
    if (tono)            input.tono             = tono as Tono
    if (contexto.trim()) input.contextoExtra    = contexto.trim()

    onSubmit(input)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generar nueva estrategia"
      subtitle="Todos los campos son opcionales. Si los dejas en blanco, la IA decide a partir de tu dashboard."
      size="lg"
    >
      <div className="flex flex-col gap-4">

        <InputField
          label="Zonas o regiones de interés"
          placeholder="Ej. México Oriente, Nuevo León, Jalisco"
          value={zonasFoco}
          onChange={setZonasFoco}
          disabled={loading}
        />

        <InputField
          label="Zonas a excluir"
          placeholder="Ej. CDMX Centro (ya tiene campaña activa)"
          value={zonasExcluir}
          onChange={setZonasExcluir}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Edad mínima"
            type="number"
            placeholder="Ej. 30"
            value={edadMin}
            onChange={setEdadMin}
            disabled={loading}
          />
          <InputField
            label="Edad máxima"
            type="number"
            placeholder="Ej. 65"
            value={edadMax}
            onChange={setEdadMax}
            disabled={loading}
          />
        </div>

        <InputField
          label="Presupuesto disponible (MXN)"
          type="number"
          placeholder="Ej. 500000"
          value={presupuesto}
          onChange={setPresupuesto}
          disabled={loading}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
            Tipos de medios preferidos
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_ORDER.map(m => {
              const active = medios.includes(m)
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMedio(m)}
                  disabled={loading}
                  title={CHANNEL_DESCRIPTION[m]}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${active
                      ? 'bg-[var(--color-hi-primary)] text-white border border-[var(--color-hi-primary)]'
                      : 'bg-[var(--color-hi-surface)] text-[var(--color-hi-text-sub)] border border-[var(--color-hi-border)] hover:border-[var(--color-hi-primary)] hover:text-[var(--color-hi-primary)]'}
                  `}
                >
                  {CHANNEL_LABEL[m]}
                </button>
              )
            })}
          </div>
          <p className="text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
            Si no eliges ninguno, la IA usa todos los medios disponibles.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Dropdown
            label="Horizonte"
            placeholder="Elige horizonte…"
            options={HORIZONTE_OPTIONS}
            value={horizonte}
            onChange={setHorizonte}
            disabled={loading}
          />
          <Dropdown
            label="Tono de la campaña"
            placeholder="Elige tono…"
            options={TONO_OPTIONS}
            value={tono}
            onChange={setTono}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--color-hi-text-sub)]">
            Contexto adicional
          </label>
          <textarea
            value={contexto}
            onChange={e => setContexto(e.target.value)}
            disabled={loading}
            placeholder="Cualquier nota: 'foco en escuelas primarias', 'evitar tono alarmista', etc."
            rows={3}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-hi-border)]
              bg-[var(--color-hi-surface)] px-3 py-2 text-sm text-[var(--color-hi-text-main)]
              placeholder:text-[var(--color-hi-text-hint)]
              focus:outline-none focus:border-[var(--color-hi-border-focus)]
              focus:ring-2 focus:ring-[var(--color-hi-primary)]/20
              transition-colors resize-none
              disabled:bg-[var(--color-hi-bg)] disabled:text-[var(--color-hi-text-hint)] disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="p-3 rounded-[var(--radius-md)] border border-[var(--color-hi-danger)] bg-red-50 text-xs text-[var(--color-hi-danger)]">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" size="md" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit}>
            Generar estrategia
          </Button>
        </div>
      </div>
    </Modal>
  )
}
