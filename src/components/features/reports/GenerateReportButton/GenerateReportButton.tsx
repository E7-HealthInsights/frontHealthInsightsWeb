import Button from '../../../common/Button/Button'

interface GenerateReportButtonProps {
  onClick?:   () => void
  loading?:   boolean
  disabled?:  boolean
  className?: string
}

export default function GenerateReportButton({
  onClick,
  loading,
  disabled,
  className = '',
}: GenerateReportButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      className={`rounded-full px-8 ${className}`}
    >
      {/* Ícono de documento */}
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
      </svg>
      Generar Reporte
    </Button>
  )
}