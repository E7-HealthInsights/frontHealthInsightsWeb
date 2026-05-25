import Button from '../../../common/Button/Button'

interface ReportCardProps {
  id: string
  title: string
  date: string
  onView: () => void
  onDownload: () => void
  onDelete: () => void
  className?: string
}

export default function ReportCard({ id, title, date, onView, onDownload, onDelete, className = '' }: ReportCardProps) {
  return (
    <div className={`bg-[var(--color-hi-surface)] rounded-[var(--radius-lg)] border border-[var(--color-hi-border)] p-5 flex flex-col gap-4 ${className}`}>

      {/* Header: icono + ID */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-hi-primary-soft)] flex items-center justify-center shrink-0">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-hi-primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <span className="text-xs text-[var(--color-hi-text-hint)] font-medium">{id}</span>
      </div>

      {/* Título */}
      <h3 className="text-base font-bold text-[var(--color-hi-navy)] leading-snug">{title}</h3>

      {/* Metadata */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span className="text-sm text-[var(--color-hi-text-sub)]">Fecha:</span>
          <span className="text-sm text-[var(--color-hi-text-main)]">{date}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--color-hi-border)]" />

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={onView}>
          <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Ver
        </Button>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            aria-label="Descargar reporte"
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-hi-border)] text-[var(--color-hi-text-sub)] hover:bg-[var(--color-hi-bg)] transition-colors cursor-pointer"
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <button
            onClick={onDelete}
            aria-label="Eliminar reporte"
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-hi-border)] text-[var(--color-hi-danger)] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}
