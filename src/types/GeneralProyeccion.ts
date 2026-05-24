import type { PuntoProyeccion } from "./Proyeccion"

export interface GeneralProyeccionParams {
    tasaCrecimiento:      number   // % anual esperado, ej: 2.1
    intensidadPolitica:   number   // 0–50 (% de reducción de tasa por política)
    periodoInicio:        number   // siempre 2024
    periodoFin:           number   // 2026–2050
  }
   
  export interface GeneralKpis {
    casosProyectados2050:  number   // millones, sin intervención
    casosEvitados:         number   // millones de diferencia
    reduccionPorcentual:   number   // %
  }
   
  export interface GeneralResultado {
    tipo:   'GENERAL'
    params: GeneralProyeccionParams
    puntos: PuntoProyeccion[]
    kpis:   GeneralKpis
  }