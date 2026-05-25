import { useState, useEffect, useRef, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

import { debounce } from 'lodash'
import Modal from '../../../common/Modal'
import type { FinanzasResultado, RubroFinanzas } from '../../../../types/FinanzasProyeccion'
import type { Proyeccion } from '../../../../types/Proyeccion'
import { simularFinanzas, type SimulacionFinanzasResponse } from '../../../../services/proyeccionService'
import Button from '../../../common/Button'


// ─── Props ────────────────────────────────────────────────────────────────────

interface FinanzasProyeccionModalProps {
  isOpen:  boolean
  onClose: () => void
  onSave:  (titulo: string, descripcion: string, resultado: FinanzasResultado) => Promise<unknown>
  saving?: boolean
  proyeccionToEdit?: Proyeccion
}

// ─── Config de rubros ─────────────────────────────────────────────────────────

const RUBROS: { key: RubroFinanzas; label: string; desc: string; color: string }[] = [
  {
    key:   'NUTRICION',
    label: 'Educación nutricional',
    desc:  'Intervención de estilo de vida en pre-diabéticos',
    color: '#38BDD1',
  },
  {
    key:   'MEDICAMENTOS',
    label: 'Medicamentos preventivos',
    desc:  'Acceso a Metformina genérica',
    color: '#1B3A6B',
  },
  {
    key:   'DETECCION',
    label: 'Detección temprana',
    desc:  'Tamizaje masivo de prediabetes',
    color: '#22C55E',
  },
  {
    key:   'ATENCION',
    label: 'Atención primaria',
    desc:  'Fortalecimiento de primer nivel',
    color: '#F59E0B',
  },
]

const PERIODOS = [2030, 2035, 2040, 2050]

const DEFAULT_DISTRIBUCION: Record<RubroFinanzas, number> = {
  NUTRICION: 25, MEDICAMENTOS: 25, DETECCION: 25, ATENCION: 25,
}

const AXIS_LABEL_STYLE = { fontSize: 10, fill: 'var(--color-hi-text-sub)' }

const inputClass = `w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
  border border-[var(--color-hi-border)] bg-[var(--color-hi-surface)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/30
  text-[var(--color-hi-text-main)] placeholder:text-[var(--color-hi-text-hint)]`

const labelClass = `block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5`

// ─── Auto-balance de distribución ─────────────────────────────────────────────

function balanceDistribucion(
  prev:      Record<RubroFinanzas, number>,
  changed:   RubroFinanzas,
  newValue:  number
): Record<RubroFinanzas, number> {
  const otros = RUBROS.map(r => r.key).filter(k => k !== changed)
  const delta = newValue - prev[changed]   // cuánto cambió el rubro modificado
  const resto = 100 - newValue             // lo que queda para los otros 3

  // Suma actual de los otros rubros
  const sumaOtros = otros.reduce((s, k) => s + prev[k], 0)

  let next: Record<RubroFinanzas, number> = { ...prev, [changed]: newValue }

  if (sumaOtros === 0) {
    // Si los otros suman 0, reparte el resto en partes iguales
    const parteIgual = Math.floor(resto / otros.length)
    otros.forEach((k, i) => {
      next[k] = i === otros.length - 1 ? resto - parteIgual * (otros.length - 1) : parteIgual
    })
  } else {
    // Reduce cada uno proporcionalmente
    let ajustados = 0
    otros.forEach((k, i) => {
      if (i < otros.length - 1) {
        const reducido = Math.round(prev[k] - (delta * prev[k] / sumaOtros))
        next[k] = Math.max(0, reducido)
        ajustados += next[k]
      } else {
        // El último absorbe el residuo para garantizar suma = 100
        next[k] = Math.max(0, resto - ajustados)
      }
    })
  }

  return next
}

function ChartSkeleton() {
  return (
    <div className="w-full h-[180px] flex items-center justify-center
      rounded-[var(--radius-md)] bg-[var(--color-hi-bg)]">
      <svg className="animate-spin w-5 h-5 text-[var(--color-hi-primary)]"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10"/>
      </svg>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinanzasProyeccionModal({
  isOpen, onClose, onSave, saving = false, proyeccionToEdit
}: FinanzasProyeccionModalProps) {

  const esEdicion = !!proyeccionToEdit
  const paramsPrev = esEdicion ? (proyeccionToEdit!.resultado as FinanzasResultado).params : null

  const [titulo,       setTitulo]       = useState('')
  const [descripcion,  setDescripcion]  = useState('')
  const [presupuesto,  setPresupuesto]  = useState(2_000)    // MXN M/año
  const [periodoFin,   setPeriodoFin]   = useState(2040)
  const [distribucion, setDistribucion] = useState<Record<RubroFinanzas, number>>(DEFAULT_DISTRIBUCION)
  const [error, setError] = useState('')

  // ── Estado de simulación (viene del backend) ──────────────────────────────
  const [simulacion,  setSimulacion]  = useState<SimulacionFinanzasResponse | null>(
    esEdicion ? (proyeccionToEdit!.resultado as FinanzasResultado) as unknown as SimulacionFinanzasResponse : null
  )
  const [simLoading, setSimLoading] = useState(false)
 
  // ── Debounce ref ──────────────────────────────────────────────────────────
  const debouncedRef = useRef(
    debounce(async (params: Parameters<typeof simularFinanzas>[0]) => {
      setSimLoading(true)
      try {
        const data = await simularFinanzas(params)
        setSimulacion(data)
      } catch (err) {
        console.error('[FinanzasModal] simularFinanzas error:', err)
      } finally {
        setSimLoading(false)
      }
    }, 400)
  )
 
  // Cancela debounce al desmontar
  useEffect(() => () => debouncedRef.current.cancel(), [])

  // Pre-llena cuando cambia proyeccionToEdit
  useEffect(() => {
    if (!isOpen) return
    if (paramsPrev && esEdicion) {
      setTitulo(proyeccionToEdit!.titulo)
      setDescripcion(proyeccionToEdit!.descripcion ?? '')
      setPresupuesto(paramsPrev.presupuestoTotalMillones)
      setPeriodoFin(paramsPrev.periodoFin)
      setDistribucion(paramsPrev.distribucion)
      // Usa el resultado almacenado — sin llamar al API
      setSimulacion((proyeccionToEdit!.resultado as FinanzasResultado) as unknown as SimulacionFinanzasResponse)
    } else {
      reset()
      // Primera simulación con valores default
      debouncedRef.current({
        presupuesto: 2_000,
        nutricion: 25, medicamentos: 25, deteccion: 25, atencion: 25,
        hasta: 2040,
      })
    }
  }, [isOpen])

  // ── Llama al API con debounce cuando cambian los sliders ──────────────────
  const triggerSimulacion = useCallback((
    pres: number,
    dist: Record<RubroFinanzas, number>,
    hasta: number
  ) => {
    debouncedRef.current({
      presupuesto:  pres,
      nutricion:    dist.NUTRICION,
      medicamentos: dist.MEDICAMENTOS,
      deteccion:    dist.DETECCION,
      atencion:     dist.ATENCION,
      hasta,
    })
  }, [])
 
  const handlePresupuesto = (val: number) => {
    setPresupuesto(val)
    triggerSimulacion(val, distribucion, periodoFin)
  }
 
  const handlePeriodo = (val: number) => {
    setPeriodoFin(val)
    triggerSimulacion(presupuesto, distribucion, val)
  }
 
  const handleRubro = (rubro: RubroFinanzas, val: number) => {
    const next = balanceDistribucion(distribucion, rubro, val)
    setDistribucion(next)
    triggerSimulacion(presupuesto, next, periodoFin)
  }
 
  // ── Datos para la gráfica ─────────────────────────────────────────────────
  const chartData = simulacion?.puntos.map(p => ({
    año: String(p.año),
    'Sin intervención': p.sinIntervencion,
    'Con intervención': p.conIntervencion,
  })) ?? []
 
  const kpis = simulacion?.kpis

  const handleSave = async () => {
    if (!titulo.trim()) { setError('El título es obligatorio.'); return }
    if (!simulacion)    { setError('Espera a que termine la simulación.'); return }
    setError('')
    const resultado: FinanzasResultado = {
      tipo:   'FINANZAS',
      params: {
        presupuestoTotalMillones: presupuesto,
        distribucion,
        periodoInicio: 2025,
        periodoFin,
      },
      puntos: simulacion.puntos,
      kpis:   simulacion.kpis as FinanzasResultado['kpis'],
    }
 
    await onSave(titulo.trim(), descripcion.trim(), resultado)
    if (!esEdicion) reset()
  }

  const reset = () => {
    setTitulo(''); setDescripcion(''); setError('')
    setPresupuesto(2_000); setPeriodoFin(2040)
    setDistribucion(DEFAULT_DISTRIBUCION)
    setSimulacion(null)
  }

  const handleClose = () => { if (!esEdicion) reset(); onClose() }
 
  const sumaDistribucion = Object.values(distribucion).reduce((s, v) => s + v, 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title= {esEdicion ? 'Editar proyección de finanzas' : 'Nueva proyección de finanzas'}
      subtitle={esEdicion
        ? `Modificando: ${proyeccionToEdit!.titulo}`
        : 'Simula el impacto de invertir en prevención de diabetes'}
      size="lg"
    >
      <div className="flex flex-col gap-5">

        {/* Nota académica */}
        <div className="bg-[var(--color-hi-primary-soft)] rounded-[var(--radius-md)] px-3 py-2">
          <p className="text-[11px] text-[var(--color-hi-navy-light)]">
            Modelo basado en DPP Study (NEJM 2002), WHO Global Action Plan 2013-2020 e IDF 2024.
            Simulación de política pública — no es un modelo clínico validado.
          </p>
        </div>

        {/* Título + Descripción */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombre del escenario *</label>
            <input
              type="text" value={titulo}
              onChange={e => { setTitulo(e.target.value); setError('') }}
              placeholder="Ej: Inversión prioritaria en metformina"
              className={`${inputClass} ${error ? 'border-[var(--color-hi-danger)] bg-red-50' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-[var(--color-hi-danger)]">{error}</p>}
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              type="text" value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Foco en detección y medicamentos 2040"
              className={inputClass}
            />
          </div>
        </div>

        {/* Presupuesto total + Período */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                Presupuesto anual
              </label>
              <span className="text-xs font-bold text-[var(--color-hi-primary)]">
                ${presupuesto.toLocaleString('es-MX')}M MXN
              </span>
            </div>
            <input type="range" min={500} max={10_000} step={500}
              value={presupuesto}
              onChange={e => handlePresupuesto(Number(e.target.value))}
              className="w-full accent-[var(--color-hi-primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
              <span>$500M</span><span>$10,000M</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5">
              Proyectar hasta
            </label>
            <div className="flex gap-2">
              {PERIODOS.map(p => (
                <button
                  key={p}
                  onClick={() => handlePeriodo(p)}
                  className={`flex-1 py-2 text-xs rounded-[var(--radius-md)] border
                    font-medium transition-colors cursor-pointer
                    ${periodoFin === p
                      ? 'bg-[var(--color-hi-primary)] text-white border-[var(--color-hi-primary)]'
                      : 'bg-[var(--color-hi-surface)] text-[var(--color-hi-text-sub)] border-[var(--color-hi-border)] hover:border-[var(--color-hi-primary)]'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 rubros de distribución */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
              Distribución del presupuesto
            </label>
            <span className={`text-xs font-bold ${
              sumaDistribucion === 100
                ? 'text-[var(--color-hi-success)]'
                : 'text-[var(--color-hi-danger)]'
            }`}>
              Total: {sumaDistribucion}%
            </span>
          </div>

          {/* Barra de distribución visual */}
          <div className="flex h-2 rounded-full overflow-hidden mb-3">
            {RUBROS.map(r => (
              <div
                key={r.key}
                style={{ width: `${distribucion[r.key]}%`, backgroundColor: r.color }}
                className="transition-all duration-200"
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {RUBROS.map(r => (
              <div key={r.key}>
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                      {r.label}
                    </span>
                    <span className="text-[10px] text-[var(--color-hi-text-hint)] ml-2">
                      {r.desc}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-bold" style={{ color: r.color }}>
                      {distribucion[r.key]}%
                    </span>
                    <span className="text-[10px] text-[var(--color-hi-text-hint)] ml-1">
                      ${Math.round(presupuesto * distribucion[r.key] / 100).toLocaleString('es-MX')}M
                    </span>
                  </div>
                </div>
                <input
                  type="range" min={0} max={100} step={5}
                  value={distribucion[r.key]}
                  onChange={e => handleRubro(r.key, Number(e.target.value))}
                  style={{ accentColor: r.color }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gráfica en tiempo real */}
        <div className="border border-[var(--color-hi-border)] rounded-[var(--radius-md)]
          bg-[var(--color-hi-bg)] p-3">
          <p className="text-xs font-semibold text-[var(--color-hi-text-sub)] mb-2">
            Vista previa — Prevalencia de diabetes en México (%)
          </p>
          {simLoading || !simulacion ? (
            <ChartSkeleton />
          ) : (
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
                <YAxis domain={[14, 'auto']}
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
          )}
        </div>

        {/* KPIs en tiempo real */}
        {kpis && (
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: `Reducción ${periodoFin}`,
                value: `${kpis.reduccionPct}%`,
                color: kpis.reduccionPct < -5
                  ? 'text-[var(--color-hi-success)]'
                  : kpis.reduccionPct < -2
                    ? 'text-[var(--color-hi-warning)]'
                    : 'text-[var(--color-hi-text-sub)]',
              },
              {
                label: 'Casos evitados',
                value: `~${(kpis.casosEvitados / 1_000_000).toFixed(1)}M`,
                color: 'text-[var(--color-hi-navy)]',
              },
              {
                label: 'Ahorro estimado',
                value: `$${kpis.ahorroEstimadoUSD_M.toLocaleString('es-MX')}M USD`,
                color: 'text-[var(--color-hi-navy)]',
              },
              {
                label: 'ROI',
                value: `${kpis.ROI}x`,
                color: kpis.ROI >= 1
                  ? 'text-[var(--color-hi-success)]'
                  : 'text-[var(--color-hi-warning)]',
              },
            ].map(({ label, value, color }) => (
              <div key={label}
                className="bg-[var(--color-hi-bg)] rounded-[var(--radius-md)] p-2.5 text-center">
                <p className="text-[10px] text-[var(--color-hi-text-hint)] mb-1 leading-tight">{label}</p>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={simLoading}>
            {esEdicion ? 'Actualizar cambios' : 'Guardar escenario'}
          </Button>
        </div>

      </div>
    </Modal>
  )
}