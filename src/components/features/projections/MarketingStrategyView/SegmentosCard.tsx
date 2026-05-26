import Card  from '../../../common/Card/Card'
import Badge from '../../../common/Badge/Badge'
import type { SegmentoDTO, ChannelTipo, CanalDTO } from '../../../../types/MarketingStrategy'
import { CHANNEL_LABEL, CHANNEL_ORDER } from './labels'

interface SegmentosCardProps {
  segmentos: SegmentoDTO[]
}

const formatNumber = (n: string): string => n

function groupByTipo(canales: CanalDTO[]): Map<ChannelTipo, CanalDTO[]> {
  const map = new Map<ChannelTipo, CanalDTO[]>()
  for (const c of canales) {
    const arr = map.get(c.tipo) ?? []
    arr.push(c)
    map.set(c.tipo, arr)
  }
  return map
}

export default function SegmentosCard({ segmentos }: SegmentosCardProps) {
  if (!segmentos?.length) return null
  return (
    <Card title="Segmentos objetivo" subtitle="Audiencias priorizadas y canales sugeridos" className="md:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segmentos.map((s, i) => {
          const grouped = groupByTipo(s.canales_recomendados ?? [])
          const orderedKeys = CHANNEL_ORDER.filter(k => grouped.has(k))
          return (
            <article
              key={`${s.nombre}-${i}`}
              className="p-4 rounded-[var(--radius-md)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)] flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-[var(--color-hi-navy)]">{s.nombre}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
                  Tamaño estimado: <span className="text-[var(--color-hi-text-sub)] normal-case">{formatNumber(s.tamano_estimado)}</span>
                </p>
              </div>

              <p className="text-xs text-[var(--color-hi-text-sub)] leading-snug">{s.perfil}</p>

              <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-hi-primary-soft)] border-l-2 border-[var(--color-hi-primary)]">
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-primary-dark)] mb-0.5">Insight clave</p>
                <p className="text-xs text-[var(--color-hi-text-main)] leading-snug">{s.insight_clave}</p>
              </div>

              {s.basado_en && s.basado_en.length > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
                    Basado en
                  </p>
                  {s.basado_en.map((b, j) => (
                    <p key={j} className="text-[11px] text-[var(--color-hi-text-sub)] leading-snug pl-2 border-l-2 border-[var(--color-hi-primary)]/60">
                      {b.dato_observado}
                    </p>
                  ))}
                </div>
              )}

              {orderedKeys.length > 0 && (
                <div className="flex flex-col gap-2.5 pt-2 border-t border-[var(--color-hi-border)]">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
                    Canales recomendados
                  </p>
                  {orderedKeys.map(tipo => (
                    <div key={tipo} className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-[var(--color-hi-navy-light)]">{CHANNEL_LABEL[tipo]}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {grouped.get(tipo)!.map((canal, j) => (
                          <span
                            key={j}
                            title={canal.razon}
                            className="inline-flex"
                          >
                            <Badge label={canal.medio} variant="info" shape="rounded" />
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </Card>
  )
}
