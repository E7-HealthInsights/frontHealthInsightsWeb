import api from '../lib/api'

export type ReporteTipo = 'DASHBOARD' | 'PROYECCION' | 'ACTIVIDAD'

export interface ReporteResponse {
  id:            string
  titulo:        string
  tipo:          ReporteTipo
  referenciaId:  string | null
  fechaCreacion: string
}

export interface CreateReportePayload {
  titulo:       string
  tipo:         ReporteTipo
  referenciaId?: string | null
}

export async function createReporte(payload: CreateReportePayload): Promise<ReporteResponse> {
  const res = await api.post<ReporteResponse>('/reportes', payload)
  return res.data
}

export async function getReportes(): Promise<ReporteResponse[]> {
  const res = await api.get<ReporteResponse[]>('/reportes')
  return res.data
}

export async function deleteReporte(id: string): Promise<void> {
  await api.delete(`/reportes/${id}`)
}
