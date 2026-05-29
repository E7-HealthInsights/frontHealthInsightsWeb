// Variantes semánticas del badge
type BadgeVariant =
  | 'success'   // Activo, estados positivos
  | 'danger'    // Inactivo, errores
  | 'warning'   // Alertas, riesgo
  | 'info'      // Roles, etiquetas informativas (usa primary-soft)
  | 'neutral'   // Estados sin carga semántica

// Forma del badge
type BadgeShape = 'pill' | 'rounded'

interface BadgeProps {
  label:      string
  variant?:   BadgeVariant
  shape?:     BadgeShape
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  danger:  'bg-red-100   text-red-600',
  warning: 'bg-amber-100 text-amber-700',
  info:    'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-navy-light)]',
  neutral: 'bg-[var(--color-hi-bg)] text-[var(--color-hi-text-sub)]',
}

const shapeClasses: Record<BadgeShape, string> = {
  pill:    'rounded-full',
  rounded: 'rounded-[var(--radius-sm)]',
}

/**
 * Badge — cubre RolLabel, StatusLabel y cualquier etiqueta pequeña.
 *
 * @example
 * // Estatus de usuario
 * <Badge label="Activo"   variant="success" />
 * <Badge label="Inactivo" variant="neutral" />
 *
 * // Rol de usuario
 * <Badge label="D.G." variant="info" shape="rounded" />
 */
export default function Badge({
  label,
  variant  = 'neutral',
  shape    = 'pill',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        text-xs font-medium
        ${variantClasses[variant]}
        ${shapeClasses[shape]}
        ${className}
      `}
    >
      {label}
    </span>
  )
}