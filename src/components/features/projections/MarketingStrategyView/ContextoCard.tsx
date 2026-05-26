import Card  from '../../../common/Card/Card'
import Badge from '../../../common/Badge/Badge'
import type { ContextoAnalizado } from '../../../../types/MarketingStrategy'

interface ContextoCardProps {
  contexto: ContextoAnalizado
}

const formatPresupuesto = (n: number | null): string => {
  if (n === null || n === undefined) return 'No especificado'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function ContextoCard({ contexto }: ContextoCardProps) {
  if (!contexto) return null
  return (
    <Card title="Contexto analizado" subtitle="Inputs interpretados por la IA" className="md:col-span-full">
      <div className="flex flex-wrap gap-4">

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Zonas</span>
          <div className="flex flex-wrap gap-1">
            {contexto.zonas_analizadas?.length > 0
              ? contexto.zonas_analizadas.map((z, i) => (
                  <Badge key={i} label={z} variant="info" shape="rounded" />
                ))
              : <Badge label="Todas" variant="neutral" shape="rounded" />}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Edades</span>
          <span className="text-sm font-medium text-[var(--color-hi-text-main)]">
            {contexto.edades_consideradas || '—'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Presupuesto</span>
          <span className="text-sm font-medium text-[var(--color-hi-text-main)]">
            {formatPresupuesto(contexto.presupuesto_mxn)}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Horizonte</span>
          <span className="text-sm font-medium text-[var(--color-hi-text-main)]">
            {contexto.horizonte_meses ? `${contexto.horizonte_meses} meses` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Tono</span>
          <span className="text-sm font-medium text-[var(--color-hi-text-main)] capitalize">
            {contexto.tono || '—'}
          </span>
        </div>

      </div>
    </Card>
  )
}
