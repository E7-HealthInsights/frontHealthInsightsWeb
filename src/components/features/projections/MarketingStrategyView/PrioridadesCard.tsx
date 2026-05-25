import Card  from '../../../common/Card/Card'
import Badge from '../../../common/Badge/Badge'
import type { PrioridadDTO, Severidad } from '../../../../types/MarketingStrategy'

const SEVERIDAD_VARIANT: Record<Severidad, 'danger' | 'warning' | 'success'> = {
  alta:  'danger',
  media: 'warning',
  baja:  'success',
}

const SEVERIDAD_LABEL: Record<Severidad, string> = {
  alta:  'Alta',
  media: 'Media',
  baja:  'Baja',
}

interface PrioridadesCardProps {
  prioridades: PrioridadDTO[]
}

export default function PrioridadesCard({ prioridades }: PrioridadesCardProps) {
  if (!prioridades?.length) return null
  return (
    <Card title="Prioridades por zona" subtitle="Ordenadas por severidad" className="md:col-span-2">
      <ul className="flex flex-col gap-3 list-none p-0 m-0">
        {prioridades.map((p, i) => (
          <li
            key={`${p.zona}-${i}`}
            className="flex items-start justify-between gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)]"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{p.zona}</p>
              <p className="mt-1 text-xs text-[var(--color-hi-text-sub)] leading-snug">{p.razon}</p>
              {p.poblacion_afectada && (
                <p className="mt-1.5 text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
                  Población afectada: <span className="text-[var(--color-hi-text-sub)] normal-case">{p.poblacion_afectada}</span>
                </p>
              )}
              {p.basado_en && p.basado_en.length > 0 && (
                <div className="mt-2 pt-2 border-t border-dashed border-[var(--color-hi-border)] flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-primary-dark)]">
                    Basado en
                  </p>
                  {p.basado_en.map((b, j) => (
                    <p key={j} className="text-[11px] text-[var(--color-hi-text-sub)] leading-snug pl-2 border-l-2 border-[var(--color-hi-primary)]">
                      {b.dato_observado}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <Badge label={SEVERIDAD_LABEL[p.severidad]} variant={SEVERIDAD_VARIANT[p.severidad]} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
