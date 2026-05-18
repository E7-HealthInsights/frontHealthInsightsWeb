import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
  } from 'recharts'
  import Card   from '../../common/Card/Card'
  import Button from '../../common/Button/Button'
import type { Proyeccion } from '../../../types/Proyeccion'
import type { GeneralResultado } from '../../../types/GeneralProyeccion'

  
  interface GeneralProyeccionDetalleProps {
    proyeccion: Proyeccion
    onVolver:   () => void
  }
  
  const AXIS_LABEL_STYLE = { fontSize: 11, fill: 'var(--color-hi-text-sub)' }
  
  const intensidadTexto = (v: number): string => {
    if (v === 0)   return 'Sin política de salud'
    if (v <= 10)   return 'Acciones mínimas'
    if (v <= 25)   return 'Programa moderado'
    if (v <= 40)   return 'Intervención fuerte'
    return 'Intervención nacional máxima'
  }
  
  export default function GeneralProyeccionDetalle({
    proyeccion, onVolver,
  }: GeneralProyeccionDetalleProps) {
    const resultado = proyeccion.resultado as unknown as GeneralResultado
    const { params, puntos, kpis } = resultado
  
    const chartData = puntos.map(p => ({
      año:               String(p.año),
      'Sin intervención': p.sinIntervencion,
      'Con política':     p.conIntervencion,
    }))
  
    return (
      <div className="space-y-6">
  
        {/* Volver */}
        <button onClick={onVolver}
          className="flex items-center gap-1.5 text-sm text-[var(--color-hi-primary)]
            hover:underline cursor-pointer">
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
            {proyeccion.descripcion || 'Proyección epidemiológica de diabetes en México'}
          </p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
  
          {/* Panel izquierdo */}
          <div className="space-y-4">
  
            {/* Gráfica */}
            <Card
              title="Evolución de casos de diabetes en México"
              subtitle="Millones de personas — comparativa sin y con política de salud"
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
                  <YAxis domain={['auto', 'auto']}
                    tick={{ fontSize: 11, fill: 'var(--color-hi-text-sub)' }}
                    axisLine={false} tickLine={false}
                    label={{ value: 'Millones de personas', angle: -90, position: 'insideLeft', offset: 4, style: AXIS_LABEL_STYLE }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}M personas`, '']}
                    contentStyle={{
                      background: 'var(--color-hi-surface)',
                      border: '1px solid var(--color-hi-border)',
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <Legend verticalAlign="top" align="center"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} iconSize={10} />
                  <Line dataKey="Sin intervención"
                    stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 4"
                    dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line dataKey="Con política"
                    stroke="var(--color-hi-primary)" strokeWidth={2}
                    dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
  
            {/* Resultados Clave */}
            <Card title="Resultados Clave">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Casos proyectados al {params.periodoFin}
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-hi-danger)]">
                    {kpis.casosProyectados2050.toFixed(1)}M
                  </p>
                  <p className="text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
                    sin política de salud
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Casos evitados
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-hi-success)]">
                    ~{kpis.casosEvitados.toFixed(1)}M
                  </p>
                  <p className="text-[10px] text-[var(--color-hi-text-hint)] mt-0.5">
                    con la política implementada
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-hi-text-sub)] mb-1">
                    Reducción lograda
                  </p>
                  <p className={`text-2xl font-bold ${
                    kpis.reduccionPorcentual < -5
                      ? 'text-[var(--color-hi-success)]'
                      : 'text-[var(--color-hi-warning)]'
                  }`}>
                    {kpis.reduccionPorcentual}%
                  </p>
                </div>
              </div>
            </Card>
  
          </div>
  
          {/* Panel derecho */}
          <div className="space-y-4">
  
            <Card title="Parámetros Usados">
              <dl className="space-y-3">
                {[
                  { label: 'Tasa de crecimiento', value: `${params.tasaCrecimiento}% anual` },
                  { label: 'Política de salud',   value: intensidadTexto(params.intensidadPolitica) },
                  { label: 'Intensidad',          value: `${params.intensidadPolitica}%` },
                  { label: 'Período',             value: `${params.periodoInicio}–${params.periodoFin}` },
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
  
            <Button variant="primary" size="md"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => alert('Generar reporte — próximamente')}>
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