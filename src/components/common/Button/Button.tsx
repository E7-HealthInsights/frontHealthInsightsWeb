type ButtonVariant = 'primary' | 'secondary' | 'icon'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?:   ButtonVariant
  size?:      ButtonSize
  disabled?:  boolean
  loading?:   boolean
  type?:      'button' | 'submit' | 'reset'
  ariaLabel?: string          // requerido en variante icon (botones sin texto visible)
  className?: string
  onClick?:   () => void
  children:   React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-hi-primary)] text-white hover:bg-[var(--color-hi-primary-dark)]',
  secondary:
    'bg-[var(--color-hi-surface)] text-[var(--color-hi-text-main)] border border-[var(--color-hi-border)] hover:bg-[var(--color-hi-bg)]',
  icon:
    'bg-transparent text-[var(--color-hi-text-hint)] hover:bg-[var(--color-hi-bg)] hover:text-[var(--color-hi-text-sub)] p-1',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2   text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  loading   = false,
  type      = 'button',
  ariaLabel,
  className = '',
  onClick,
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)]
        transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${variant !== 'icon' ? sizeClasses[size] : ''}
        ${className}
      `}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="animate-spin w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      )}
      {children}
    </button>
  )
}
