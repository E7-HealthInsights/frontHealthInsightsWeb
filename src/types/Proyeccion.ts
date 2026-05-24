import type { FinanzasResultado } from "./FinanzasProyeccion"
import type { GeneralResultado } from "./GeneralProyeccion"

export interface PuntoProyeccion {
    año:             number
    sinIntervencion: number   // % prevalencia
    conIntervencion: number
  }


  export type ProyeccionResultado = FinanzasResultado | GeneralResultado
 
  export interface ProyeccionDTO {
    id:            string
    titulo:        string
    descripcion:   string
    fechaCreacion: string
    resultado:     string   // JSON stringificado de ProyeccionResultado
  }
   
  export interface Proyeccion extends Omit<ProyeccionDTO, 'resultado'> {
    resultado: ProyeccionResultado
  }
   
  export function parseProyeccion(dto: ProyeccionDTO): Proyeccion {
    return { ...dto, resultado: JSON.parse(dto.resultado) as ProyeccionResultado }
  }