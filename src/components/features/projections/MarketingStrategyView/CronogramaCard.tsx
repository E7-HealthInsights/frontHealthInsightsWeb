import Card from '../../../common/Card/Card'
import type { CronogramaItem } from '../../../../types/MarketingStrategy'

interface CronogramaCardProps {
  items: CronogramaItem[]
}

export default function CronogramaCard({ items }: CronogramaCardProps) {
  if (!items?.length) return null
  const sorted = [...items].sort((a, b) => a.mes - b.mes)
  return (
    <Card title="Cronograma" subtitle="Hitos clave por mes">
      <ol className="flex flex-col gap-3 list-none p-0 m-0">
        {sorted.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[var(--color-hi-primary-soft)] border border-[var(--color-hi-primary)] flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--color-hi-primary-dark)]">M{item.mes}</span>
              </div>
              {i < sorted.length - 1 && (
                <div className="w-0.5 h-4 bg-[var(--color-hi-border)] mt-1" />
              )}
            </div>
            <p className="text-xs text-[var(--color-hi-text-main)] leading-snug pt-2">{item.hito}</p>
          </li>
        ))}
      </ol>
    </Card>
  )
}
