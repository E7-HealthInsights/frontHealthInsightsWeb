import type { FinanzasResultado } from "../../../types/FinanzasProyeccion"
import type { GeneralResultado } from "../../../types/GeneralProyeccion"
import type { Proyeccion } from "../../../types/Proyeccion"
import Button from "../../common/Button"
import { FinanzasDetalle } from "./FinanzasProyeccionDetalle"
import GeneralDetalle from "./GeneralProyeccionDetalle"

interface ProyeccionDetalleProps {
    proyeccion: Proyeccion
    onVolver:   () => void
    onEditar:   (proyeccion: Proyeccion) => void
    onEliminar: (id: string) => void
  }

export default function ProyeccionDetalle({ proyeccion, onVolver, onEditar, onEliminar }: ProyeccionDetalleProps) {
    const resultado = proyeccion.resultado
   
    return (
      <div className="space-y-6">
   
        {/* Volver + acciones */}
        <div className="flex items-center justify-between">
          <button onClick={onVolver}
            className="flex items-center gap-1.5 text-sm text-[var(--color-hi-primary)] hover:underline cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Volver
          </button>
        </div>
   
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-hi-navy)]">{proyeccion.titulo}</h1>
          <p className="text-sm text-[var(--color-hi-text-sub)] mt-0.5">
            {proyeccion.descripcion || 'Proyección de prevalencia de diabetes en México'}
          </p>
        </div>
   
        {resultado.tipo === 'FINANZAS'
          ? <FinanzasDetalle proyeccion={proyeccion} resultado={resultado as FinanzasResultado} onEditar={onEditar} onEliminar={onEliminar} />
          : <GeneralDetalle proyeccion={proyeccion} resultado={resultado as GeneralResultado} onEditar={onEditar} onEliminar={onEliminar} />
        }
      </div>
    )
  }