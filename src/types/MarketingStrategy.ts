export type Severidad   = 'alta' | 'media' | 'baja'
export type ChannelTipo = 'digital' | 'ooh' | 'radio' | 'tv' | 'comunitario' | 'prensa' | 'salud' | 'messaging'
export type TacticaTipo =
  | 'espectacular' | 'red_social' | 'radio' | 'tv'
  | 'volantes'     | 'evento'     | 'salud' | 'influencer'
  | 'sms_whatsapp' | 'prensa'     | 'podcast' | 'email'
export type Tono = 'educativo' | 'urgente' | 'esperanzador' | 'motivacional'

export interface CanalDTO {
  medio: string
  tipo:  ChannelTipo
  razon: string
}

export interface TacticaDTO {
  tipo:            TacticaTipo
  descripcion:     string
  frecuencia:      string
  presupuesto_pct: number
}

// Cada cita a un widget que sustenta una recomendación de la IA.
export interface BasadoEnDTO {
  widget_id:      string
  dato_observado: string
}

export interface PrioridadDTO {
  zona:               string
  razon:              string
  severidad:          Severidad
  poblacion_afectada: string
  basado_en?:         BasadoEnDTO[]
}

export interface SegmentoDTO {
  nombre:               string
  perfil:               string
  tamano_estimado:      string
  insight_clave:        string
  canales_recomendados: CanalDTO[]
  basado_en?:           BasadoEnDTO[]
}

export interface CampaniaDTO {
  titulo:             string
  objetivo:           string
  mensaje_clave:      string
  audiencia_objetivo: string
  zonas:              string[]
  tacticas:           TacticaDTO[]
  kpi_principal:      string
  meta_3_meses:       string
  kpis_secundarios:   string[]
}

export interface CronogramaItem {
  mes:  number
  hito: string
}

export interface ContextoAnalizado {
  zonas_analizadas:    string[]
  edades_consideradas: string
  presupuesto_mxn:     number | null
  horizonte_meses:     number
  tono:                string
}

export interface MarketingStrategyPayload {
  contexto_analizado:     ContextoAnalizado
  resumen_ejecutivo:      string
  prioridades:            PrioridadDTO[]
  segmentos_objetivo:     SegmentoDTO[]
  campanias:              CampaniaDTO[]
  cronograma:             CronogramaItem[]
  oportunidades:          string[]
  riesgos:                string[]
  proxima_revision_dias:  number
}

// Estado del ciclo de vida de una estrategia (loop de feedback).
export type EstadoStrategy = 'propuesta' | 'ejecutada' | 'descartada'

export const ESTADO_LABEL: Record<EstadoStrategy, string> = {
  propuesta:  'Propuesta',
  ejecutada:  'Ejecutada',
  descartada: 'Descartada',
}

export interface ComentarioDTO {
  id:        string
  contenido: string
  creadoEn:  string
}

export interface MarketingStrategyDTO {
  id:             string
  usuarioId:      string
  creadoEn:       string
  payload:        MarketingStrategyPayload
  estado:         EstadoStrategy
  notaResultado?: string | null
  fechaRevision?: string | null
  comentarios:    ComentarioDTO[]
}

export interface GenerateStrategyInput {
  contextoExtra?:    string
  zonasFoco?:        string[]
  zonasExcluir?:     string[]
  edadMin?:          number
  edadMax?:          number
  presupuestoMxn?:   number
  mediosPreferidos?: ChannelTipo[]
  horizonteMeses?:   3 | 6 | 12
  tono?:             Tono
}
