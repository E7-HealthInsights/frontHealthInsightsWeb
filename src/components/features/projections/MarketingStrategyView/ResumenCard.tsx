import Card from '../../../common/Card/Card'

interface ResumenCardProps {
  resumen:             string
  proximaRevisionDias: number
  creadoEn:            string
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('es-MX', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit',
    })
  } catch {
    return iso
  }
}

export default function ResumenCard({ resumen, proximaRevisionDias, creadoEn }: ResumenCardProps) {
  return (
    <Card title="Resumen ejecutivo" className="md:col-span-3">
      <p className="text-sm text-[var(--color-hi-text-main)] leading-relaxed">
        {resumen}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-hi-text-sub)]">
        <span>
          Generada el <span className="font-medium text-[var(--color-hi-text-main)]">{formatDate(creadoEn)}</span>
        </span>
        <span className="opacity-30">·</span>
        <span>
          Próxima revisión sugerida: <span className="font-medium text-[var(--color-hi-primary-dark)]">{proximaRevisionDias} días</span>
        </span>
      </div>
    </Card>
  )
}
