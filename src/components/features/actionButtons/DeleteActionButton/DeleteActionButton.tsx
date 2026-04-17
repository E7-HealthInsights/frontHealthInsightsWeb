import Button from "../../../common/Button"

interface DeleteButtonProps {
    onClick?:   () => void
    disabled?:  boolean
    className?: string
  }
   
  /**
   * DeleteButton — botón ícono de bote de basura.
   * Al hacer hover se pinta del rojo danger de HealthInsights.
   *
   * @example
   * <DeleteButton onClick={() => confirmDelete(user)} />
   */
  export default function DeleteActionButton({ onClick, disabled, className = '' }: DeleteButtonProps) {
    return (
      <Button
        variant="icon"
        ariaLabel="Eliminar"
        onClick={onClick}
        disabled={disabled}
        className={`hover:text-[var(--color-hi-danger)] hover:bg-red-50 ${className}`}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
          stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,4 12,4"/>
          <path d="M5 4V3h5v1"/>
          <path d="M4 4l.8 8.5a1 1 0 001 .9h4.4a1 1 0 001-.9L12 4"/>
        </svg>
      </Button>
    )
  }