import Card              from '../../common/Card/Card'
import Button            from '../../common/Button/Button'
import ImpactBadge       from './ImpactBadge'
import EditActionButton  from '../actionButtons/EditActionButton/EditActionButton'
import DeleteActionButton from '../actionButtons/DeleteActionButton/DeleteActionButton'
import type { Proyeccion }      from '../../../types/Proyeccion'
import type { GeneralResultado } from '../../../types/GeneralProyeccion'

interface ProjectionCardProps {
  proyeccion: Proyeccion
  onVer:      (p: Proyeccion) => void
  onDelete:   (id: string) => void
}

export default function ProjectionCard({ proyeccion, onVer, onDelete }: ProjectionCardProps) {
  const resultado  = proyeccion.resultado
  const esGeneral  = 'tipo' in resultado && resultado.tipo === 'GENERAL'

  const fecha = new Date(proyeccion.fechaCreacion).toLocaleDateString('es-MX', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // ── Campos normalizados para ambos tipos ──────────────────────────────────

  if (esGeneral) {
    // Director General
    const r = resultado as unknown as GeneralResultado
    const reduccion   = r.kpis.reduccionPorcentual
    const casosEvit   = `~${r.kpis.casosEvitados.toFixed(1)}M`
    const periodo     = `${r.params.periodoInicio}–${r.params.periodoFin}`
    const intensidad  = `Política ${r.params.intensidadPolitica}%`

    return (
      <Card
        title={proyeccion.titulo}
        subtitle={proyeccion.descripcion || undefined}
        actions={[{ label: 'Eliminar', onClick: () => onDelete(proyeccion.id), danger: true }]}
      >
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between">
            <ImpactBadge reduccion={reduccion} />
            <span className="text-xs text-[var(--color-hi-text-hint)]">{fecha}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-hi-border)] pt-3">
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Casos evitados</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{casosEvit}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Reducción lograda</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{reduccion}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Período</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{periodo}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-hi-text-hint)]">Intensidad</p>
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{intensidad}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--color-hi-border)] pt-3">
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
            <EditActionButton onClick={() => {}} />
            <DeleteActionButton onClick={() => onDelete(proyeccion.id)} />
          </div>

        </div>
      </Card>
    )
  }

  // ── Director de Finanzas (default) ────────────────────────────────────────

  const { kpis, params } = resultado
  const reduccion = kpis.reduccionProyectada
  const casosEvit = kpis.casosEvitados > 0
    ? `~${(kpis.casosEvitados / 1_000_000).toFixed(1)}M`
    : '—'
  const ahorro    = kpis.ahorroEstimadoMillones > 0
    ? `$${kpis.ahorroEstimadoMillones.toLocaleString('es-MX')}M`
    : '—'
  const periodo   = `${params.periodoInicio}–${params.periodoFin}`
  const tipo      = params.tipoInversion
    ? params.tipoInversion.charAt(0) + params.tipoInversion.slice(1).toLowerCase()
    : '—'

  return (
    <Card
      title={proyeccion.titulo}
      subtitle={proyeccion.descripcion || undefined}
      actions={[{ label: 'Eliminar', onClick: () => onDelete(proyeccion.id), danger: true }]}
    >
      <div className="flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <ImpactBadge reduccion={reduccion} />
          <span className="text-xs text-[var(--color-hi-text-hint)]">{fecha}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-hi-border)] pt-3">
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Casos evitados</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{casosEvit}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Ahorro estimado</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{ahorro}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Período</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{periodo}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--color-hi-text-hint)]">Tipo</p>
            <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{tipo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--color-hi-border)] pt-3">
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
          <EditActionButton onClick={() => {}} />
          <DeleteActionButton onClick={() => onDelete(proyeccion.id)} />
        </div>

      </div>
    </Card>
  )
}