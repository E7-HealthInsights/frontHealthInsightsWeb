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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ResumenCard
        resumen={p.resumen_ejecutivo}
        proximaRevisionDias={p.proxima_revision_dias}
        creadoEn={dto.creadoEn}
      />
      <ContextoCard      contexto={p.contexto_analizado} />
      <PrioridadesCard   prioridades={p.prioridades} />
      <OportunidadesCard oportunidades={p.oportunidades} />
      <SegmentosCard     segmentos={p.segmentos_objetivo} />
      <CampaniasCard     campanias={p.campanias} />
      <CronogramaCard    items={p.cronograma} />
      <RiesgosCard       riesgos={p.riesgos} />

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
