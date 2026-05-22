import api from '../lib/api'

export interface LogActividadResponse {
  id:          string
  accion:      string
  adminNombre: string | null
  detalle:     string | null
  entidadId:   string
  entidadTipo: string
  fecha:       string
}

export async function getActividad(): Promise<LogActividadResponse[]> {
  const res = await api.get<LogActividadResponse[]>('/actividad')
  return res.data
}
