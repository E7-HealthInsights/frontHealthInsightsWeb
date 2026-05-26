import api from '../lib/api'
import type { PaginadoResponse } from '../types/PaginadoResponse'

export interface LogActividadResponse {
  id:          string
  accion:      string
  adminNombre: string | null
  detalle:     string | null
  entidadId:   string
  entidadTipo: string
  fecha:       string
}

export async function getActividad(page = 1, size=10, search=''): Promise<PaginadoResponse<LogActividadResponse>> {
  const res = await api.get<PaginadoResponse<LogActividadResponse>>('/actividad', {
    params: { page, size, search }
  })
  return res.data
}
