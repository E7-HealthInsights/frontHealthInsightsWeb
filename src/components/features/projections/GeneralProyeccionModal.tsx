import { useState, useEffect, useRef, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { GeneralResultado } from '../../../types/GeneralProyeccion'
import Modal from '../../common/Modal'
import Button from '../../common/Button'
import type { Proyeccion } from '../../../types/Proyeccion'
import { simularGeneral, type SimulacionGeneralResponse } from '../../../services/proyeccionService'
import { debounce } from 'lodash'


// ─── Props ────────────────────────────────────────────────────────────────────

interface GeneralProyeccionModalProps {
  isOpen:  boolean
  onClose: () => void
  onSave:  (titulo: string, descripcion: string, resultado: GeneralResultado) => Promise<unknown>
  saving?: boolean
  proyeccionToEdit?: Proyeccion
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const AXIS_LABEL_STYLE = { fontSize: 10, fill: 'var(--color-hi-text-sub)' }

const inputClass = `w-full px-3 py-2 text-sm rounded-[var(--radius-md)]
  border border-[var(--color-hi-border)] bg-[var(--color-hi-surface)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-hi-primary)]/30
  text-[var(--color-hi-text-main)] placeholder:text-[var(--color-hi-text-hint)]`

const labelClass = `block text-xs font-semibold text-[var(--color-hi-text-main)] mb-1.5`

const POLITICAS = [
  { val: 0,  label: 'Sin cambios',        sub: 'Presupuesto actual'       },
  { val: 20, label: 'Prevención básica',   sub: 'Etiquetado + impuestos'   },
  { val: 40, label: 'Intervención DPP',    sub: 'Adaptación DPP a México'  },
  { val: 60, label: 'Programa nacional',   sub: 'Plan integrado SSA'       },
  { val: 80, label: 'Reforma estructural', sub: 'Inversión masiva WHO'     },
  { val: 100,label: 'Máxima cobertura',    sub: 'Intervención total'       },
]

// Etiquetas descriptivas para la intensidad de política
const intensidadLabel = (v: number): string => {
  if (v === 0)   return 'Sin política de salud'
  if (v <= 10)   return 'Acciones mínimas'
  if (v <= 25)   return 'Programa moderado'
  if (v <= 40)   return 'Intervención fuerte'
  return 'Intervención nacional máxima'
}

// Etiquetas para la tasa de crecimiento
const tasaLabel = (v: number): string => {
  if (v <= 1.0)  return 'Escenario muy optimista'
  if (v <= 1.8)  return 'Escenario optimista'
  if (v <= 2.3)  return 'Tendencia histórica'
  if (v <= 3.0)  return 'Escenario pesimista'
  return 'Escenario crítico'
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
 
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

export default function GeneralProyeccionModal({
  isOpen, onClose, onSave, saving = false, proyeccionToEdit
}: GeneralProyeccionModalProps) {

  const esEdicion = !!proyeccionToEdit
  const paramsPrev = esEdicion ? (proyeccionToEdit!.resultado as GeneralResultado).params : null

  const [titulo,           setTitulo]           = useState('')
  const [descripcion,      setDescripcion]      = useState('')
  const [tasa,             setTasa]             = useState(2.1)
  const [intensidad,       setIntensidad]       = useState(20)
  const [periodoFin,       setPeriodoFin]       = useState(2035)
  const [error,            setError]            = useState('')

  const [simulacion,  setSimulacion]  = useState<SimulacionGeneralResponse | null>(
    esEdicion ? (proyeccionToEdit!.resultado as GeneralResultado) as unknown as SimulacionGeneralResponse : null
  )
  const [simLoading, setSimLoading] = useState(false)
 
  // ── Debounce ref ──────────────────────────────────────────────────────────
  const debouncedRef = useRef(
    debounce(async (params: Parameters<typeof simularGeneral>[0]) => {
      setSimLoading(true)
      try {
        const data = await simularGeneral(params)
        setSimulacion(data)
      } catch (err) {
        console.error('[GeneralModal] simularGeneral error:', err)
      } finally {
        setSimLoading(false)
      }
    }, 400)
  )
 
  useEffect(() => () => debouncedRef.current.cancel(), [])

  useEffect(() => {

    if (!isOpen) return

    if (paramsPrev && esEdicion) {
      setTitulo(proyeccionToEdit.titulo)
      setDescripcion(proyeccionToEdit.descripcion ?? '')
      setTasa(paramsPrev.tasaCrecimiento)
      setIntensidad(paramsPrev.intensidadPolitica)
      setPeriodoFin(paramsPrev.periodoFin)
      setSimulacion((proyeccionToEdit!.resultado as GeneralResultado) as unknown as SimulacionGeneralResponse)
    } else {
      reset()
      debouncedRef.current({ tasaCrecimiento: 2.1, intensidadPolitica: 20, inicio: 2025, hasta: 2035 })
    }
  }, [isOpen])

  // ── Trigger simulación ────────────────────────────────────────────────────
  const triggerSimulacion = useCallback((t: number, int: number, hasta: number) => {
    debouncedRef.current({ tasaCrecimiento: t, intensidadPolitica: int, inicio: 2024, hasta })
  }, [])
 
  const handleTasa = (val: number) => { setTasa(val); triggerSimulacion(val, intensidad, periodoFin) }
  const handleIntensidad = (val: number) => { setIntensidad(val); triggerSimulacion(tasa, val, periodoFin) }
  const handlePeriodo = (val: number) => { setPeriodoFin(val); triggerSimulacion(tasa, intensidad, val) }
 
  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = simulacion?.puntos.map(p => ({
    año: String(p.año),
    'Sin intervención': p.sinIntervencion,
    'Con política': p.conIntervencion,
  })) ?? []
 
  const kpis = simulacion?.kpis

  const handleSave = async () => {
    if (!titulo.trim()) { setError('El título es obligatorio.'); return }
    if (!simulacion)    { setError('Espera a que termine la simulación.'); return }
    setError('')

    const resultado: GeneralResultado = {
      tipo:   'GENERAL',
      params: { tasaCrecimiento: tasa, intensidadPolitica: intensidad, periodoInicio: 2025, periodoFin },
      puntos: simulacion.puntos,
      kpis:   simulacion.kpis as GeneralResultado['kpis'],
    }

    await onSave(titulo.trim(), descripcion.trim(), resultado)
    if(!esEdicion) { reset() }
  }

  const reset = () => {
    setTitulo(''); setDescripcion(''); setError('')
    setTasa(2.1); setIntensidad(20); setPeriodoFin(2035)
    setSimulacion(null)
  }

  const handleClose = () => { if (!esEdicion) reset(); onClose() }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={esEdicion ? 'Editar proyección' : 'Nueva proyección'}
      subtitle={esEdicion ? 'Modificando Proyección' : '¿Cómo evolucionará la diabetes en México según distintas políticas públicas?'}
      size="lg"
    >
      <div className="flex flex-col gap-5">

        {/* Nota académica */}
        <div className="bg-[var(--color-hi-primary-soft)] rounded-[var(--radius-md)] px-3 py-2">
          <p className="text-[11px] text-[var(--color-hi-navy-light)]">
            Proyección epidemiológica basada en IDF 2024 y PAHO 1990–2022.
            Herramienta de análisis de política pública — no predicción clínica validada.
          </p>
        </div>

        {/* Título + Descripción */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nombre del escenario *</label>
            <input
              type="text" value={titulo}
              onChange={e => { setTitulo(e.target.value); setError('') }}
              placeholder="Ej: Plan Nacional de Salud 2035"
              className={`${inputClass} ${error ? 'border-[var(--color-hi-danger)] bg-red-50' : ''}`}
            />
            {error && <p className="mt-1 text-xs text-[var(--color-hi-danger)]">{error}</p>}
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input
              type="text" value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: Basado en metas del Plan Nacional 2030"
              className={inputClass}
            />
          </div>
        </div>

        {/* Tres sliders */}
        <div className="flex flex-col gap-4">

          {/* Tasa de crecimiento */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                Tasa de crecimiento anual esperada
              </label>
              <span className="text-xs font-bold text-[var(--color-hi-primary)]">
                {tasa.toFixed(1)}% — {tasaLabel(tasa)}
              </span>
            </div>
            <input type="range" min={0.5} max={3.5} step={0.1}
              value={tasa}
              onChange={e => handleTasa(Number(e.target.value))}
              className="w-full accent-[var(--color-hi-primary)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
              <span>0.5% (óptimo)</span>
              <span className="text-[var(--color-hi-primary)]">↑ Histórica: 2.1%</span>
              <span>3.5% (crítico)</span>
            </div>
          </div>

          {/* Intensidad de política */}
          <div>
            <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--color-hi-text-main)]">
                Intensidad de política de salud
                </label>
                <span className="text-xs font-bold text-[var(--color-hi-primary)]">
                {intensidad}%
                </span>
            </div>
            <input type="range" min={0} max={50} step={10}
                value={intensidad}
                onChange={e => handleIntensidad(Number(e.target.value))}
                className="w-full accent-[var(--color-hi-primary)]"
            />

            {/* Etiquetas descriptivas por nivel ← agrega esto */}
            <div className="mt-2 grid grid-cols-6 gap-0.5">
              {POLITICAS.map(({ val, label, sub }) => (
                <button
                    key={val}
                    onClick={() => handleIntensidad(val)}
                    className={`text-center p-1.5 rounded-[var(--radius-sm)] border transition-colors cursor-pointer
                    ${intensidad === val
                        ? 'border-[var(--color-hi-primary)] bg-[var(--color-hi-primary-soft)]'
                        : 'border-transparent hover:border-[var(--color-hi-border)]'
                    }`}
                >
                    <p className={`text-[9px] font-semibold leading-tight
                    ${intensidad === val
                        ? 'text-[var(--color-hi-primary)]'
                        : 'text-[var(--color-hi-text-main)]'
                    }`}>
                    {label}
                    </p>
                    <p className="text-[8px] text-[var(--color-hi-text-hint)] leading-tight mt-0.5">
                    {sub}
                    </p>
                </button>
                ))}
            </div>
        </div>

          {/* Horizonte */}
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
              onChange={e => handlePeriodo(Number(e.target.value))}
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
            Vista previa — Personas con diabetes en México (millones)
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
                <YAxis domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'var(--color-hi-text-sub)' }}
                  axisLine={false} tickLine={false}
                  label={{ value: 'Millones', angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}M personas`, '']}
                  contentStyle={{
                    background: 'var(--color-hi-surface)',
                    border: '1px solid var(--color-hi-border)',
                    borderRadius: 6, fontSize: 11,
                  }}
                />
                <Legend verticalAlign="top" align="center"
                  wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                <Line dataKey="Sin intervención"
                  stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 3"
                  dot={false} activeDot={{ r: 4 }} />
                <Line dataKey="Con política"
                  stroke="var(--color-hi-primary)" strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* KPIs en tiempo real */}
        {kpis && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: `Casos sin política al ${periodoFin}`,
                value: `${kpis.casosProyectados2050.toFixed(1)}M`,
                color: 'text-[var(--color-hi-danger)]',
              },
              {
                label: 'Casos evitados',
                value: kpis.casosEvitados > 0
                  ? `~${kpis.casosEvitados.toFixed(1)}M`
                  : '—',
                color: 'text-[var(--color-hi-success)]',
              },
              {
                label: 'Reducción lograda',
                value: `${kpis.reduccionPorcentual}%`,
                color: kpis.reduccionPorcentual < -5
                  ? 'text-[var(--color-hi-success)]'
                  : kpis.reduccionPorcentual < -2
                    ? 'text-[var(--color-hi-warning)]'
                    : 'text-[var(--color-hi-text-sub)]',
              },
            ].map(({ label, value, color }) => (
              <div key={label}
                className="bg-[var(--color-hi-bg)] rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-[10px] text-[var(--color-hi-text-hint)] mb-1">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
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