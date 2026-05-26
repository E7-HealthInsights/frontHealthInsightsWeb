import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  import Card from '../../common/Card/Card'
  import Button from '../../common/Button'
import type { Proyeccion } from '../../../types/Proyeccion'
import type { FinanzasResultado } from '../../../types/FinanzasProyeccion'

  
  interface FinanzasProyeccionDetalleProps {
    proyeccion: Proyeccion
    resultado:  FinanzasResultado
    onEditar:   (p: Proyeccion) => void
    onEliminar: (id: string)    => void
  }

  const AXIS_LABEL_STYLE = { fontSize: 11, fill: 'var(--color-hi-text-sub)' }
  
  export function FinanzasDetalle({ proyeccion, resultado, onEditar, onEliminar }: FinanzasProyeccionDetalleProps) {
    const { params, puntos, kpis } = resultado
   
    const chartData = puntos.map(p => ({
      año:               String(p.año),
      'Sin intervención': p.sinIntervencion,
      'Con intervención': p.conIntervencion,
    }))
   
    const rubros = [
      { key: 'NUTRICION',    label: 'Educación nutricional'  },
      { key: 'MEDICAMENTOS', label: 'Medicamentos preventivos' },
      { key: 'DETECCION',    label: 'Detección temprana'     },
      { key: 'ATENCION',     label: 'Atención primaria'      },
    ] as const
   
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
   
        {/* Panel izquierdo */}
        <div className="space-y-4">
          <Card
            title="Proyección de Prevalencia de Diabetes"
            subtitle="Comparación entre escenario base y con inversión en prevención"
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}
                margin={{ top: 24, right: 16, left: 16, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3"
                  stroke="var(--color-hi-border)" vertical={false} />
                <XAxis dataKey="año"
                  tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                  label={{ value: 'Año', position: 'insideBottom', offset: -12, style: AXIS_LABEL_STYLE }}
                />
                <YAxis domain={[14, 'auto']}
                  tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                  axisLine={false} tickLine={false}
                  label={{ value: '% Prevalencia', angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }}
                />
                <Tooltip contentStyle={{
                  background: 'var(--color-hi-surface)',
                  border: '1px solid var(--color-hi-border)',
                  borderRadius: 8, fontSize: 12,
                }} />
                <Legend verticalAlign="top" align="center"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} iconSize={10} />
                <Line dataKey="Sin intervención"
                  stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 4"
                  dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line dataKey="Con intervención"
                  stroke="var(--color-hi-primary)" strokeWidth={2}
                  dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
   
          {/* KPIs */}
          <Card title="Resultados Clave">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                  Reducción al {params.periodoFin}
                </p>
                <p className={`text-2xl font-bold ${
                  kpis.reduccionPct < -5
                    ? 'text-[var(--color-hi-success)]'
                    : 'text-[var(--color-hi-warning)]'
                }`}>
                  {kpis.reduccionPct}%
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">Casos evitados</p>
                <p className="text-2xl font-bold text-[var(--color-hi-navy)]">
                  ~{(kpis.casosEvitados / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">Ahorro estimado</p>
                <p className="text-2xl font-bold text-[var(--color-hi-navy)]">
                  ${kpis.ahorroEstimadoUSD_M.toLocaleString('es-MX')}M USD
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">ROI</p>
                <p className={`text-2xl font-bold ${
                  kpis.ROI >= 1
                    ? 'text-[var(--color-hi-success)]'
                    : 'text-[var(--color-hi-warning)]'
                }`}>
                  {kpis.ROI}x
                </p>
                <p className="text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
                  por cada $1 MXN invertido
                </p>
              </div>
            </div>
          </Card>
        </div>
   
        {/* Panel derecho */}
        <div className="space-y-4">
          <Card title="Parámetros Usados">
            <dl className="space-y-3">
              <div>
                <dt className="text-[10px] text-[var(--color-hi-text-hint)] uppercase tracking-wide">
                  Presupuesto anual
                </dt>
                <dd className="text-sm font-medium text-[var(--color-hi-text-main)] mt-0.5">
                  ${params.presupuestoTotalMillones.toLocaleString('es-MX')}M MXN
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--color-hi-text-hint)] uppercase tracking-wide">
                  Período
                </dt>
                <dd className="text-sm font-medium text-[var(--color-hi-text-main)] mt-0.5">
                  {params.periodoInicio}–{params.periodoFin}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--color-hi-text-hint)] uppercase tracking-wide mb-2">
                  Distribución
                </dt>
                {rubros.map(r => (
                  <div key={r.key} className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--color-hi-text-sub)]">{r.label}</span>
                    <span className="font-semibold text-[var(--color-hi-text-main)]">
                      {params.distribucion[r.key]}%
                      <span className="text-[var(--color-hi-text-hint)] font-normal ml-1">
                        (${Math.round(params.presupuestoTotalMillones * params.distribucion[r.key] / 100).toLocaleString('es-MX')}M)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </dl>
          </Card>
   
          {/* Editar */}
        <Button variant="secondary" size="md"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onEditar(proyeccion)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar escenario
        </Button>
 
        {/* Eliminar */}
        <Button variant="secondary" size="md"
          className="w-full flex items-center justify-center gap-2
            text-[var(--color-hi-danger)] hover:border-[var(--color-hi-danger)]"
          onClick={() => onEliminar(proyeccion.id)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          Eliminar escenario
        </Button>
          
        </div>
      </div>
    )
  }