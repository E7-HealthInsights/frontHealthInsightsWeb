import type { ActivityAction } from "../../../../../types/ActivityActions"
import Badge from "../../../../common/Badge"

interface ActionBadgeProps {
    action: string
    className?: string
  }

  const accionConfig: Record<ActivityAction, { classes: string }> = {
    'Usuario creado':      { classes: 'bg-green-100 text-green-700' },
    'Usuario editado':     { classes: 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-navy-light)]' },
    'Usuario eliminado':   { classes: 'bg-red-100 text-red-600' },
    'Usuario desactivado': { classes: 'bg-red-100 text-red-600' },
    'Usuario reactivado':  { classes: 'bg-green-100 text-green-700' },
    'Dataset creado':      { classes: 'bg-green-100 text-green-700' },
    'Dataset editado':     { classes: 'bg-[var(--color-hi-primary-soft)] text-[var(--color-hi-navy-light)]' },
    'Dataset eliminado':   { classes: 'bg-red-100 text-red-600' },
    'Dataset desactivado': { classes: 'bg-red-100 text-red-600' },
    'Dataset reactivado':  { classes: 'bg-green-100 text-green-700' },
  }

  const matchKey = (action: string): ActivityAction | undefined =>
    (Object.keys(accionConfig) as ActivityAction[]).find(key => action.startsWith(key))

  function ActionBadge({ action, className }: ActionBadgeProps) {
    const key     = matchKey(action)
    const classes = key ? accionConfig[key].classes : ''
    return (
      <Badge
        label={action}
        variant="info"
        shape="pill"
        className={`whitespace-nowrap ${classes} ${className ?? ''}`}
      />
    )
  }

export default ActionBadge