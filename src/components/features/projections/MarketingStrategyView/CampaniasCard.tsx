import Card  from '../../../common/Card/Card'
import Badge from '../../../common/Badge/Badge'
import type { CampaniaDTO, TacticaDTO } from '../../../../types/MarketingStrategy'
import { TACTICA_LABEL } from './labels'

interface CampaniasCardProps {
  campanias: CampaniaDTO[]
}

function TacticaRow({ t }: { t: TacticaDTO }) {
  const pct = Math.max(0, Math.min(100, t.presupuesto_pct ?? 0))
  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-[var(--radius-sm)] bg-[var(--color-hi-surface)] border border-[var(--color-hi-border)]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge label={TACTICA_LABEL[t.tipo] ?? t.tipo} variant="info" shape="rounded" />
          <span className="text-xs text-[var(--color-hi-text-sub)] truncate">{t.frecuencia}</span>
        </div>
        <span className="text-xs font-bold text-[var(--color-hi-primary-dark)] whitespace-nowrap">{pct}%</span>
      </div>
      <p className="text-xs text-[var(--color-hi-text-main)] leading-snug">{t.descripcion}</p>
      <div className="h-1.5 w-full rounded-full bg-[var(--color-hi-bg)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-hi-primary)] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function CampaniasCard({ campanias }: CampaniasCardProps) {
  if (!campanias?.length) return null
  return (
    <Card title="Campañas propuestas" subtitle="Cada campaña con sus tácticas concretas y peso presupuestal">
      <div className="flex flex-col gap-4">
        {campanias.map((c, i) => (
          <article
            key={`${c.titulo}-${i}`}
            className="p-4 rounded-[var(--radius-md)] border border-[var(--color-hi-border)] bg-[var(--color-hi-bg)] flex flex-col gap-3"
          >
            <header className="flex items-start gap-2">
              <span className="text-xs font-bold text-[var(--color-hi-primary-dark)]">#{i + 1}</span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-[var(--color-hi-navy)] leading-snug">{c.titulo}</h4>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">
                  Audiencia: <span className="text-[var(--color-hi-text-sub)] normal-case">{c.audiencia_objetivo}</span>
                </p>
              </div>
            </header>

            <p className="text-xs text-[var(--color-hi-text-sub)] leading-snug">
              <span className="font-medium text-[var(--color-hi-text-main)]">Objetivo:</span> {c.objetivo}
            </p>

            <blockquote className="border-l-2 border-[var(--color-hi-primary)] pl-3 text-xs italic text-[var(--color-hi-text-main)]">
              "{c.mensaje_clave}"
            </blockquote>

            {c.zonas?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Zonas:</span>
                {c.zonas.map((z, j) => (
                  <Badge key={j} label={z} variant="neutral" shape="rounded" />
                ))}
              </div>
            )}

            {c.tacticas?.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Tácticas</p>
                <div className="flex flex-col gap-2">
                  {c.tacticas.map((t, j) => <TacticaRow key={j} t={t} />)}
                </div>
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-[var(--color-hi-border)] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">KPI principal</p>
                <p className="mt-0.5 text-xs font-medium text-[var(--color-hi-text-main)] leading-snug">{c.kpi_principal}</p>
                {c.kpis_secundarios?.length > 0 && (
                  <ul className="mt-1.5 flex flex-col gap-0.5 list-none p-0 m-0">
                    {c.kpis_secundarios.map((k, j) => (
                      <li key={j} className="text-[10px] text-[var(--color-hi-text-sub)] leading-snug pl-2 border-l border-[var(--color-hi-border)]">
                        {k}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[var(--color-hi-text-hint)]">Meta a 3 meses</p>
                <p className="mt-0.5 text-xs font-bold text-[var(--color-hi-primary-dark)] leading-snug">{c.meta_3_meses}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
