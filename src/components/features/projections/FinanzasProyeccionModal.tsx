import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  type TipoInversion,
  type ProyeccionResultado,
} from '../../../types/Proyeccion'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import { calcularProyeccion } from '../../../services/proyeccionService'

// ─── Props ────────────────────────────────────────────────────────────────────

interface FinanzasProyeccionModalProps {
  isOpen:  boolean
  onClose: () => void
  onSave:  (titulo: string, descripcion: string, resultado: ProyeccionResultado) => Promise<unknown>
  saving?: boolean
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<TipoInversion, string> = {
  PREVENCION:  'Prevención',
  TRATAMIENTO: 'Tratamiento',
  DETECCION:   'Detección',
}

const TIPO_DESC: Record<TipoInversion, string> = {
  PREVENCION:  'Mayor impacto a largo plazo',
  TRATAMIENTO: 'Reduce complicaciones activas',
  DETECCION:   'Identifica casos no diagnosticados',
}

const AXIS_LABEL_STYLE = { fontSize: 10, fill: 'var(--color-hi-text-sub)' }

const inputClass = `w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
  border border-[var(--color-hi-border)] bg-[var(--color-hi-surface)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/30
  text-[var(--color-hi-text-main)] placeholder:text-[var(--color-hi-text-hint)]`

const labelClass = `block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5`

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanzasProyeccionModal({
  isOpen, onClose, onSave, saving = false,
}: FinanzasProyeccionModalProps) {

  const [titulo,      setTitulo]      = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo,        setTipo]        = useState<TipoInversion>('PREVENCION')
  const [inversion,   setInversion]   = useState(200)    // MXN millones/año
  const [periodoFin,  setPeriodoFin]  = useState(2035)
  const [error,       setError]       = useState('')

  // Recalcula en tiempo real con cada cambio de slider
  const resultado = useMemo(() => calcularProyeccion({
    tipoInversion:          tipo,
    inversionAnualMillones: inversion,
    periodoInicio:          2024,
    periodoFin,
  }), [tipo, inversion, periodoFin])

  const { kpis, puntos } = resultado

  // Datos para Recharts
  const chartData = puntos.map(p => ({
    año:               String(p.año),
    'Sin intervención': p.sinIntervencion,
    'Con intervención': p.conIntervencion,
  }))

  const reset = () => {
    setTitulo(''); setDescripcion('')
    setTipo('PREVENCION'); setInversion(200); setPeriodoFin(2035); setError('')
  }

  const handleSave = async () => {
    if (!titulo.trim()) { setError('El título es obligatorio.'); return }
    setError('')
    await onSave(titulo.trim(), descripcion.trim(), resultado)
    reset()
  }

  const handleClose = () => { reset(); onClose() }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Proyección"
      subtitle="Simula el impacto de distintas estrategias de inversión en salud"
      size="lg"
    >
      <div className="flex flex-col gap-5">

        {/* Nota académica */}
        <div className="bg-[var(--color-hi-primary-soft)] rounded-[var(--radius-md)] px-3 py-2">
          <p className="text-[11px] text-[var(--color-hi-navy-light)]">
            Modelo basado en literatura científica (DPP Study NEJM 2002, WHO Global Diabetes
            Compact 2021). Simulación de política pública, no predicción clínica validada.
          </p>
        </div>

        {/* Título + Descripción */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombre del escenario *</label>
            <input
              type="text" value={titulo}
              onChange={e => { setTitulo(e.target.value); setError('') }}
              placeholder="Ej: Inversión agresiva en prevención"
              className={`${inputClass} ${error ? 'border-[var(--color-hi-danger)] bg-red-50' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-[var(--color-hi-danger)]">{error}</p>}
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              type="text" value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Enfoque en zonas rurales de alto riesgo"
              className={inputClass}
            />
          </div>
        </div>

        {/* Tipo de inversión */}
        <div>
          <label className={labelClass}>Tipo de inversión</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TIPO_LABELS) as TipoInversion[]).map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`py-2.5 px-3 text-left rounded-[var(--radius-md)] border
                  transition-colors cursor-pointer
                  ${tipo === t
                    ? 'bg-[var(--color-hi-primary)] text-white border-[var(--color-hi-primary)]'
                    : 'bg-[var(--color-hi-surface)] border-[var(--color-hi-border)] hover:border-[var(--color-hi-primary)]'
                  }`}
              >
                <p className={`text-xs font-semibold ${tipo === t ? 'text-white' : 'text-[var(--color-hi-text-main)]'}`}>
                  {TIPO_LABELS[t]}
                </p>
                <p className={`text-[10px] mt-0.5 ${tipo === t ? 'text-white/75' : 'text-[var(--color-hi-text-hint)]'}`}>
                  {TIPO_DESC[t]}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Dos sliders */}
        <div className="grid grid-cols-2 gap-5">

          {/* Inversión anual */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                Inversión anual
              </label>
              <span className="text-xs font-bold text-[var(--color-hi-primary)]">
                ${inversion}M MXN
              </span>
            </div>
            <input type="range" min={0} max={1000} step={10}
              value={inversion}
              onChange={e => setInversion(Number(e.target.value))}
              className="w-full accent-[var(--color-hi-primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
              <span>$0M</span><span>$1000M</span>
            </div>
          </div>

          {/* Hasta el año */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                Proyectar hasta
              </label>
              <span className="text-xs font-bold text-[var(--color-hi-primary)]">
                {periodoFin}
              </span>
            </div>
            <input type="range" min={2026} max={2050} step={1}
              value={periodoFin}
              onChange={e => setPeriodoFin(Number(e.target.value))}
              className="w-full accent-[var(--color-hi-primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
              <span>2026</span><span>2050</span>
            </div>
          </div>

        </div>

        {/* Gráfica en tiempo real */}
        <div className="border border-[var(--color-hi-border)] rounded-[var(--radius-md)]
          bg-[var(--color-hi-bg)] p-3">
          <p className="text-xs font-semibold text-[var(--color-hi-text-sub)] mb-2">
            Vista previa — Prevalencia de diabetes en México (%)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}
              margin={{ top: 16, right: 12, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="var(--color-hi-border)" vertical={false} />
              <XAxis dataKey="año"
                tick={{ fontSize: 10, fill: 'var(--color-hi-text-sub)' }}
                axisLine={false} tickLine={false}
                interval="preserveStartEnd"
                label={{ value: 'Año', position: 'insideBottom', offset: -12, style: AXIS_LABEL_STYLE }}
              />
              <YAxis domain={[0, 'auto']}
                tick={{ fontSize: 10, fill: 'var(--color-hi-text-sub)' }}
                axisLine={false} tickLine={false}
                label={{ value: '% Prevalencia', angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }}
              />
              <Tooltip contentStyle={{
                background: 'var(--color-hi-surface)',
                border: '1px solid var(--color-hi-border)',
                borderRadius: 6, fontSize: 11,
              }} />
              <Legend verticalAlign="top" align="center"
                wrapperStyle={{ fontSize: 10 }} iconSize={8} />
              <Line dataKey="Sin intervención"
                stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 3"
                dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="Con intervención"
                stroke="var(--color-hi-primary)" strokeWidth={2}
                dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* KPIs en tiempo real */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: `Reducción al ${periodoFin}`,
              value: `${kpis.reduccionProyectada}%`,
              color: kpis.reduccionProyectada < -10
                ? 'text-[var(--color-hi-success)]'
                : kpis.reduccionProyectada < -3
                  ? 'text-[var(--color-hi-warning)]'
                  : 'text-[var(--color-hi-text-sub)]',
            },
            {
              label: 'Casos evitados',
              value: kpis.casosEvitados > 0
                ? `~${(kpis.casosEvitados / 1_000_000).toFixed(1)}M`
                : '—',
              color: 'text-[var(--color-hi-navy)]',
            },
            {
              label: 'Ahorro estimado',
              value: kpis.ahorroEstimadoMillones > 0
                ? `$${kpis.ahorroEstimadoMillones.toLocaleString('es-MX')}M`
                : '—',
              color: 'text-[var(--color-hi-navy)]',
            },
          ].map(({ label, value, color }) => (
            <div key={label}
              className="bg-[var(--color-hi-bg)] rounded-[var(--radius-md)] p-3 text-center">
              <p className="text-[10px] text-[var(--color-hi-text-hint)] mb-1">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Guardar escenario
          </Button>
        </div>

      </div>
    </Modal>
  )
}