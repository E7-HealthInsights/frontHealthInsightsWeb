interface PaginationProps {
  currentPage: number
  totalPages:  number
  onChange:    (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3)            pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btnBase = `
    inline-flex items-center justify-center
    min-w-[32px] h-8 px-2 rounded-[var(--radius-md)]
    text-sm font-medium transition-colors
  `
  const btnActive   = 'bg-[var(--color-hi-primary)] text-white'
  const btnInactive = 'text-[var(--color-hi-text-sub)] hover:bg-[var(--color-hi-bg)] cursor-pointer'
  const btnDisabled = 'text-[var(--color-hi-text-hint)] cursor-not-allowed opacity-50'

  return (
    <div className="flex items-center gap-1">

      {/* Anterior */}
      <button
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        aria-label="Página anterior"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 2 4 7 9 12" />
        </svg>
      </button>

      {/* Páginas */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-[var(--color-hi-text-hint)]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Siguiente */}
      <button
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        aria-label="Página siguiente"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="5 2 10 7 5 12" />
        </svg>
      </button>

    </div>
  )
}
