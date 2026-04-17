import Button from "../../../common/Button"

interface EditButtonProps {
  onClick?:   () => void
  disabled?:  boolean
  className?: string
}


export default function EditActionButton({ onClick, disabled, className = '' }: EditButtonProps) {
  return (
    <Button
      variant="icon"
      ariaLabel="Editar"
      onClick={onClick}
      disabled={disabled}
      className={`hover:text-[var(--color-hi-primary)] hover:bg-[var(--color-hi-primary-soft)] ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 2.5l2 2L5 12H3v-2L10.5 2.5z"/>
      </svg>
    </Button>
  )
}