import type { MarketingStrategyDTO, EstadoStrategy } from '../../../../types/MarketingStrategy'
import ResumenCard          from './ResumenCard'
import ContextoCard         from './ContextoCard'
import PrioridadesCard      from './PrioridadesCard'
import OportunidadesCard    from './OportunidadesCard'
import SegmentosCard        from './SegmentosCard'
import CampaniasCard        from './CampaniasCard'
import CronogramaCard       from './CronogramaCard'
import RiesgosCard          from './RiesgosCard'
import StrategyControlsCard from './StrategyControlsCard'

interface MarketingStrategyViewProps {
  dto:              MarketingStrategyDTO
  onUpdateState:    (estado: EstadoStrategy, notaResultado: string) => Promise<void>
  onAddComment:     (contenido: string) => Promise<void>
  isUpdatingState?: boolean
  isAddingComment?: boolean
  errorState?:      string | null
  errorComment?:    string | null
}

export default function MarketingStrategyView({
  dto,
  onUpdateState,
  onAddComment,
  isUpdatingState,
  isAddingComment,
  errorState,
  errorComment,
}: MarketingStrategyViewProps) {
  const p = dto.payload
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min">
      <ResumenCard
        resumen={p.resumen_ejecutivo}
        proximaRevisionDias={p.proxima_revision_dias}
        creadoEn={dto.creadoEn}
      />
      <ContextoCard      contexto={p.contexto_analizado} />

      {/* Pareadas: ambas son listas detalladas y largas */}
      <PrioridadesCard   prioridades={p.prioridades} />
      <CronogramaCard    items={p.cronograma} />

      {/* Pareadas: ambas son listas cortas de bullets */}
      <OportunidadesCard oportunidades={p.oportunidades} />
      <RiesgosCard       riesgos={p.riesgos} />

      <SegmentosCard     segmentos={p.segmentos_objetivo} />
      <CampaniasCard     campanias={p.campanias} />

      <StrategyControlsCard
        strategy={dto}
        onUpdateState={onUpdateState}
        onAddComment={onAddComment}
        isUpdatingState={isUpdatingState}
        isAddingComment={isAddingComment}
        errorState={errorState}
        errorComment={errorComment}
      />
    </div>
  )
}
