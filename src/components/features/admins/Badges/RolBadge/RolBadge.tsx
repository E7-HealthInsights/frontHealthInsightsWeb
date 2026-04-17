
import type { UserRol } from "../../../../../types/UserRol";
import Badge from "../../../../common/Badge";

interface RolBadgeProps {
    rol:        UserRol
    className?: string
  }

 function RolBadge({ rol, className }: RolBadgeProps) {
    //usando el componente Badge para mostrar el rol del usuario
    return (
        Badge({
            label: rol,
            // variant: si es admin se resalta, D.G, D.F y D.M de colores distintos
            variant: "info",
            shape: 'pill',
            className: className
        })
    )
}

  export default RolBadge