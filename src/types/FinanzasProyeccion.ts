import type { PuntoProyeccion } from "./Proyeccion"


export type RubroFinanzas = 'NUTRICION' | 'MEDICAMENTOS' | 'DETECCION' | 'ATENCION'

export interface FinanzasParams {
  presupuestoTotalMillones: number              // MXN millones/año
  distribucion: Record<RubroFinanzas, number>  // % por rubro, suman 100
  periodoInicio: number                         // siempre 2025
  periodoFin:    number                         // 2030 | 2035 | 2040 | 2050
}

export interface FinanzasKpis {
  reduccionPct:         number   // % diferencia relativa entre curvas al año final
  casosEvitados:        number   // personas
  ahorroEstimadoUSD_M:  number   // millones USD
  ROI:                  number   // "por cada $1 MXN invertido, el sistema ahorra $X MXN"
}

export interface FinanzasResultado {
  tipo:   'FINANZAS'
  params: FinanzasParams
  puntos: PuntoProyeccion[]
  kpis:   FinanzasKpis
}