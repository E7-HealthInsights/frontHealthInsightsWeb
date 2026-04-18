import type { ActivityAction } from "../../../../../types/ActivityActions"
import Badge from "../../../../common/Badge"

interface ActionBadgeProps {
    action: string
    className?: string
  }

  const accionConfig: Record<ActivityAction, { classes: string }> = {
    'Usuario creado':    { classes: 'bg-green-100 text-green-700' },
    'Usuario editado':   { classes: 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-navy-light)]' },
    'Usuario eliminado': { classes: 'bg-red-100 text-red-600' },
    'Dataset creado':    { classes: 'bg-green-100 text-green-700' },
    'Dataset editado':   { classes: 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-navy-light)]' },
    'Dataset eliminado': { classes: 'bg-red-100 text-red-600' },
  }

  function ActionBadge({ action, className }: ActionBadgeProps) {
    return (
      <Badge
        label={action}
        variant="info"
        shape="pill"
        className={`${accionConfig[action as ActivityAction].classes} ${className ?? ''}`}
      />
    )
  }

export default ActionBadge