import api from "../lib/api"
import type { GeneralProyeccionParams, GeneralResultado } from "../types/GeneralProyeccion"
import type { FinanzasParams, FinanzasResultado, RubroFinanzas } from "../types/FinanzasProyeccion"
import { parseProyeccion, type Proyeccion, type ProyeccionDTO, type ProyeccionResultado, type PuntoProyeccion } from "../types/Proyeccion"


export interface SimulacionFinanzasResponse {
  puntos: PuntoProyeccion[]
  kpis: {
    reduccionPct:        number
    casosEvitados:       number
    ahorroEstimadoUSD_M: number
    ROI:                 number
  }
}
 
export interface SimulacionGeneralResponse {
  puntos: PuntoProyeccion[]
  kpis: {
    casosProyectados2050: number
    casosEvitados:        number
    reduccionPorcentual:  number
  }
}

// ─── Simulación en backend ────────────────────────────────────────────────────
//
// Los cálculos ya NO viven en el frontend.
// El backend recibe query params y devuelve puntos + KPIs calculados en Java.
 
export async function simularFinanzas(params: {
  presupuesto:  number
  nutricion:    number
  medicamentos: number
  deteccion:    number
  atencion:     number
  hasta:        number
}): Promise<SimulacionFinanzasResponse> {
  const res = await api.get<SimulacionFinanzasResponse>(
    '/proyecciones/simular/finanzas',
    { params }
  )
  return res.data
}
 
export async function simularGeneral(params: {
  tasaCrecimiento:    number
  intensidadPolitica: number
  inicio:             number
  hasta:              number
}): Promise<SimulacionGeneralResponse> {
  const res = await api.get<SimulacionGeneralResponse>(
    '/proyecciones/simular/general',
    { params }
  )
  return res.data
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getProyecciones(): Promise<Proyeccion[]> {
  const res = await api.get<ProyeccionDTO[]>('/proyecciones')
  return res.data.map(parseProyeccion)
}
 
export async function saveProyeccion(
  titulo:      string,
  descripcion: string,
  resultado:   ProyeccionResultado
): Promise<Proyeccion> {
  const res = await api.post<ProyeccionDTO>('/proyecciones', {
    titulo,
    descripcion,
    resultado: JSON.stringify(resultado),
  })
  return parseProyeccion(res.data)
}

export async function updateProyeccion(
  id:          string,
  titulo:      string,
  descripcion: string,
  resultado:   ProyeccionResultado
): Promise<Proyeccion> {
  const res = await api.patch<ProyeccionDTO>(`/proyecciones/${id}`, {
    titulo,
    descripcion,
    resultado: JSON.stringify(resultado),
  })
  return parseProyeccion(res.data)
}
 
export async function deleteProyeccion(id: string): Promise<void> {
  await api.delete(`/proyecciones/${id}`)
}