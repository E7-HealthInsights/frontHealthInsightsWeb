import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  import Card from '../../common/Card/Card'
  import Button from '../../common/Button'
  import type { Proyeccion } from '../../../types/Proyeccion'
  
  interface ProyeccionDetalleProps {
    proyeccion: Proyeccion
    onVolver:   () => void
  }
  
  const AXIS_LABEL_STYLE = { fontSize: 11, fill: 'var(--color-hi-text-sub)' }
  
  export default function ProyeccionDetalle({ proyeccion, onVolver }: ProyeccionDetalleProps) {
    const { params, puntos, kpis } = proyeccion.resultado
  
    // Recharts necesita los puntos como objetos con keys string
    const chartData = puntos.map(p => ({
      año:             String(p.año),
      'Sin Intervención': p.sinIntervencion,
      'Con intervención': p.conIntervencion,
    }))
  
    const seriesKeys = Object.keys(chartData[0]).filter(k => k !== 'año')
  
    return (
      <div className="space-y-6">
  
        {/* Volver */}
        <button
          onClick={onVolver}
          className="flex items-center gap-1.5 text-sm text-[var(--color-hi-primary)]
            hover:underline cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver
        </button>
  
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">
            {proyeccion.titulo}
          </h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            Comparativa de prevalencia con y sin intervención
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
  
          {/* Panel izquierdo — gráfica + resultados */}
          <div className="space-y-4">
  
            {/* Gráfica */}
            <Card title="Proyección de Prevalencia de Diabetes"
              subtitle="Comparación entre escenario base y con intervención">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}
                  margin={{ top: 24, right: 16, left: 16, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="var(--color-hi-border)" vertical={false} />
                  <XAxis
                    dataKey="año"
                    tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                    axisLine={false} tickLine={false}
                    label={{ value: 'Año', position: 'insideBottom', offset: -12, style: AXIS_LABEL_STYLE }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                    axisLine={false} tickLine={false}
                    label={{ value: '% Prevalencia', angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-hi-surface)',
                      border: '1px solid var(--color-hi-border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="top" align="center"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
                    iconSize={10}
                  />
                  {seriesKeys.map((key, i) => (
                    <Line
                      key={key}
                      dataKey={key}
                      stroke={i === 0 ? '#94A3B8' : 'var(--color-hi-primary)'}
                      strokeWidth={2}
                      strokeDasharray={i === 0 ? '5 4' : undefined}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card>
  
            {/* Resultados Clave */}
            <Card title="Resultados Clave">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Reducción Proyectada {params.periodoFin}
                  </p>
                  <p className={`text-2xl font-bold ${
                    kpis.reduccionProyectada <= -6
                      ? 'text-[var(--color-hi-success)]'
                      : 'text-[var(--color-hi-warning)]'
                  }`}>
                    {kpis.reduccionProyectada}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Casos evitados
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-hi-navy)]">
                    ~{(kpis.casosEvitados / 1_000_000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Ahorro Estimado
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-hi-navy)]">
                    ${kpis.ahorroEstimadoMillones}M
                  </p>
                </div>
              </div>
            </Card>
  
          </div>
  
          {/* Panel derecho — parámetros + acción */}
          <div className="space-y-4">
  
            {/* Parámetros usados */}
            <Card title="Parámetros Usados">
              <dl className="space-y-3">
                {[
                  { label: 'Reducción lograda',  value: `${kpis.reduccionProyectada}%`              },
                  { label: 'Inversión',  value: `$${params.inversionAnualMillones}M USD/año`  },
                  { label: 'Período',    value: `${params.periodoInicio}–${params.periodoFin}` },
                  { label: 'Tipo',       value: params.tipoInversion.charAt(0) +
                                                 params.tipoInversion.slice(1).toLowerCase()  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-[10px] text-[var(--color-hi-text-hint)] uppercase tracking-wide">
                      {label}
                    </dt>
                    <dd className="text-sm font-medium text-[var(--color-hi-text-main)] mt-0.5">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
  
            {/* Generar reporte */}
            <Button
              variant="primary"
              size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => alert('Generar reporte — próximamente')}
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 1h7l3 3v10H4V1z"/>
                <path d="M10 1v3h3"/>
                <line x1="6" y1="7" x2="10" y2="7"/>
                <line x1="6" y1="10" x2="10" y2="10"/>
              </svg>
              Generar Reporte
            </Button>
  
          </div>
        </div>
      </div>
    )
  }