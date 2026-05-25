import Card              from '../../../common/Card/Card'
import Button            from '../../../common/Button/Button'
import ImpactBadge       from '../ImpactBadge/ImpactBadge'
import type { GeneralResultado } from '../../../../types/GeneralProyeccion'
import type { Proyeccion } from '../../../../types/Proyeccion'
import type { FinanzasResultado } from '../../../../types/FinanzasProyeccion'

interface ProjectionCardProps {
  proyeccion: Proyeccion
  onVer:      (p: Proyeccion) => void
}

export default function ProjectionCard({ proyeccion, onVer }: ProjectionCardProps) {
  const resultado  = proyeccion.resultado

  const fecha = new Date(proyeccion.fechaCreacion).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // ── Director de Finanzas v2 ───────────────────────────────────────────────
 
  if (resultado.tipo === 'FINANZAS') {
    const r = resultado as FinanzasResultado
    return (
      <Card
        title={proyeccion.titulo}
        subtitle={proyeccion.descripcion || undefined}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <ImpactBadge reduccion={r.kpis.reduccionPct} />
            <span className="text-xs text-[var(--color-hi-text-hint)]">{fecha}</span>
          </div>
 
          <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-hi-border)] pt-3">
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Casos evitados</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
                ~{(r.kpis.casosEvitados / 1_000_000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Ahorro USD</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
                ${r.kpis.ahorroEstimadoUSD_M.toLocaleString('es-MX')}M
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Período</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
                {r.params.periodoInicio}–{r.params.periodoFin}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">ROI</p>
              <p className={`text-sm font-semibold ${
                r.kpis.ROI >= 1
                  ? 'text-[var(--color-hi-success)]'
                  : 'text-[var(--color-hi-warning)]'
              }`}>
                {r.kpis.ROI}x
              </p>
            </div>
          </div>
 
          <div className="flex items-center gap-2 border-t border-[var(--color-hi-border)] pt-3" data-testid="ver-detalle-btn">
            <Button variant="secondary" size="sm" data-testid="ver-detalle-btn"
              onClick={() => onVer(proyeccion)}
              className="flex-1 flex items-center justify-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Ver
            </Button>
          </div>
        </div>
      </Card>
    )
  }
 
  // ── Director General ──────────────────────────────────────────────────────
 
  const r = resultado as GeneralResultado
  return (
    <Card
      title={proyeccion.titulo}
      subtitle={proyeccion.descripcion || undefined}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <ImpactBadge reduccion={r.kpis.reduccionPorcentual} />
          <span className="text-xs text-[var(--color-hi-text-hint)]">{fecha}</span>
        </div>
 
        <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-hi-border)] pt-3">
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Casos evitados</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
              ~{r.kpis.casosEvitados.toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Reducción lograda</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
              {r.kpis.reduccionPorcentual}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Período</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
              {r.params.periodoInicio}–{r.params.periodoFin}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Intensidad</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">
              {r.params.intensidadPolitica}%
            </p>
          </div>
        </div>
 
        <div className="flex items-center gap-2 border-t border-[var(--color-hi-border)] pt-3" data-testid="ver-detalle-btn"> 
          <Button variant="secondary" size="sm"
            onClick={() => onVer(proyeccion)}
            className="flex-1 flex items-center justify-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Ver
          </Button>
        </div>
      </div>
    </Card>
  )
}