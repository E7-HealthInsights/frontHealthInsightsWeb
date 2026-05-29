import Card from '../../../common/Card/Card'

interface OportunidadesCardProps {
  oportunidades: string[]
}

export default function OportunidadesCard({ oportunidades }: OportunidadesCardProps) {
  if (!oportunidades?.length) return null
  return (
    <Card title="Oportunidades">
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {oportunidades.map((o, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-hi-text-main)] leading-snug">
            <svg
              aria-hidden="true"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="var(--color-hi-success)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0"
            >
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
            </svg>
            <span>{o}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
