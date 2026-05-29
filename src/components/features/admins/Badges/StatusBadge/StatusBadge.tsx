
import Badge from "../../../../common/Badge";


interface StatusBadgeProps {
    status:     'Activo' | 'Inactivo' | string
    className?: string
  }

 function StatusBadge({ status, className }: StatusBadgeProps) {
    //usando el componente Badge para mostrar el estatus del usuario
    return (
        Badge({
            label: status,
            variant: status === 'Activo' ? 'success' : 'danger',
            shape: 'pill',
            className: className,
        })
    )
}

  export default StatusBadge