export type TipoInversion = 'PREVENCION' | 'TRATAMIENTO' | 'DETECCION'

export interface ProyeccionParams {
  tipoInversion:          TipoInversion
  inversionAnualMillones: number   // MXN millones/año (0–500)
  periodoInicio:          number   // siempre 2024
  periodoFin:             number   // 2026–2050
}

export interface PuntoProyeccion {
  año:             number
  sinIntervencion: number   // % prevalencia
  conIntervencion: number
}

export interface ProyeccionKpis {
  reduccionProyectada:    number   // % diferencia entre curvas en año final, ej: -15.8
  casosEvitados:          number   // personas
  ahorroEstimadoMillones: number   // USD millones
}

export interface ProyeccionResultado {
  params: ProyeccionParams
  puntos: PuntoProyeccion[]
  kpis:   ProyeccionKpis
}

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