import Card from '../../../common/Card/Card'

interface RiesgosCardProps {
  riesgos: string[]
}

export default function RiesgosCard({ riesgos }: RiesgosCardProps) {
  if (!riesgos?.length) return null
  return (
    <Card title="Riesgos a considerar">
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {riesgos.map((r, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-[var(--color-hi-text-main)] leading-snug"
          >
            <svg
              aria-hidden="true"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="var(--color-hi-warning)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="mt-0.5 flex-shrink-0"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9"  x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
