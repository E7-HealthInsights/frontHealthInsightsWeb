import api from "../lib/api"

// ── Tipos de datos que devuelve el GET /widgets ───────────────────────────────

export interface ChartWidgetData {
  labels: (string | number)[]
  values: number[]
}

export interface StatWidgetData {
  value: number | string
  label?: string
}

export interface MultiSeriesPoint {
  label: string | number
  [seriesKey: string]: string | number
}

export interface MultiSeriesWidgetData {
  seriesKeys: string[]
  data:       MultiSeriesPoint[]
}

export interface HeatmapWidgetData {
  rows: Record<string, string | number>[]
}

export type WidgetData =
  | ChartWidgetData
  | StatWidgetData
  | ErrorWidgetData
  | MultiSeriesWidgetData
  | HeatmapWidgetData
  | TableWidgetData

export type TableRow = Record<string, string | number | null>

export interface TableWidgetData {
  columns: string[]
  rows:    TableRow[]
}

export interface ErrorWidgetData {
  error: string
}

// ── Tipos de widget ───────────────────────────────────────────────────────────

export type WidgetTipo = 'STAT' | 'LINE' | 'BAR' | 'PIE' | 'MULTISERIES' | 'MULTIBAR' | 'HEATMAP' | 'TABLE'

// Tipado semántico de la métrica: cómo interpretar los números del widget.
// Lo lee la IA para no confundir % con conteos ni mezclar tasas con totales.
export type TipoSemantico =
  | 'porcentaje'   // 0..100
  | 'conteo'       // casos absolutos
  | 'tasa'         // relativo a población base
  | 'moneda'       // MXN, USD, etc.
  | 'indice'       // índice compuesto (base=100)
  | 'texto'        // valor no numérico

// Nivel geográfico del dato. Evita que la IA mezcle municipios con estados.
export type NivelGeografico =
  | 'pais'
  | 'estado'
  | 'municipio'
  | 'colonia'
  | 'sin_geo'

export interface WidgetDTO {
  id:               string
  orden:            number
  titulo:           string
  subtitulo?:       string
  seriesName?:      string
  xAxisLabel?:      string
  yAxisLabel?:      string
  tipo:             WidgetTipo
  tipoSemantico?:   TipoSemantico | null
  nivelGeografico?: NivelGeografico | null
  esDefault:        boolean
  data:             WidgetData
}

// ── Type guards ───────────────────────────────────────────────────────────────

export const isChartData = (d: WidgetData): d is ChartWidgetData =>
  'labels' in d && 'values' in d

export const isStatData = (d: WidgetData): d is StatWidgetData =>
  'value' in d

export const isMultiSeriesData = (d: WidgetData): d is MultiSeriesWidgetData =>
  'seriesKeys' in d && 'data' in d && Array.isArray((d as MultiSeriesWidgetData).seriesKeys)

export const isTableData = (d: WidgetData): d is TableWidgetData =>
  'columns' in d && 'rows' in d

export const isErrorData = (d: WidgetData): d is ErrorWidgetData =>
  'error' in d

export const isHeatmapData = (d: WidgetData): d is HeatmapWidgetData =>
  'rows' in d && Array.isArray((d as HeatmapWidgetData).rows)

// ── Mapping tipo nombre → tipoId (Tipo_de_Grafica en BD) ─────────────────────

export const TIPO_ID_MAP: Record<WidgetTipo, number> = {
  STAT:        1,
  LINE:        2,
  BAR:         3,
  PIE:         4,
  TABLE:       5,
  MULTISERIES: 6,
  MULTIBAR:    7,
  HEATMAP:     5, // no existe como tipo propio; se maneja como TABLE en backend
}

// ── Sanitización de filtroVal ─────────────────────────────────────────────────
// Previene caracteres que podrían usarse en inyección SQL.
// El backend ya usa QUOTE() en los stored procedures, esto es defensa en profundidad.

const UNSAFE_PATTERN = /['";\-\-\/\*\\]/g

export function sanitizeFiltroVal(raw: string): string {
  return raw.replace(UNSAFE_PATTERN, '').trim()
}

// ── Construcción del queryConfig según tipo ───────────────────────────────────

export interface QueryConfigStat {
  tabla:       string
  funcion:     string
  columna:     string
  filtroCol?:  string
  filtroVal?:  string
  filtroCol2?: string
  filtroVal2?: string
}

export interface QueryConfigSeries {
  tabla:       string
  colX:        string
  colY:        string
  funcion:     string
  groupBy:     string
  filtroCol?:  string
  filtroVal?:  string
  filtroCol2?: string
  filtroVal2?: string
}

export interface QueryConfigPie {
  tabla:    string
  colLabel: string
  colValue: string
  funcion:  string
}

export interface QueryConfigTable {
  tabla:    string
  columnas: string
  limite:   number
}

export interface QueryConfigMultiseries {
  tabla:       string
  colX:        string
  colY:        string
  colSerie:    string
  funcion:     string
  filtroCol?:  string
  filtroVal?:  string
  filtroCol2?: string
  filtroVal2?: string
}

export type QueryConfig =
  | QueryConfigStat
  | QueryConfigSeries
  | QueryConfigPie
  | QueryConfigTable
  | QueryConfigMultiseries

// ── Payload para crear un widget ──────────────────────────────────────────────

export interface CreateWidgetPayload {
  titulo:           string
  tipo:             WidgetTipo
  queryConfig:      QueryConfig
  orden:            number
  tipoSemantico?:   TipoSemantico
  nivelGeografico?: NivelGeografico
}

// Labels en español para los selectores de UI.
export const TIPO_SEMANTICO_LABEL: Record<TipoSemantico, string> = {
  porcentaje: 'Porcentaje (0–100)',
  conteo:     'Conteo / casos absolutos',
  tasa:       'Tasa (relativa a población)',
  moneda:     'Moneda (MXN, USD…)',
  indice:     'Índice (base = 100)',
  texto:      'Texto / categórico',
}

export const NIVEL_GEOGRAFICO_LABEL: Record<NivelGeografico, string> = {
  pais:      'País',
  estado:    'Estado',
  municipio: 'Municipio',
  colonia:   'Colonia / AGEB',
  sin_geo:   'Sin geografía',
}

// ── Operaciones API ───────────────────────────────────────────────────────────

export async function getMyWidgets(): Promise<WidgetDTO[]> {
  const res = await api.get<WidgetDTO[]>('/widgets')
  return res.data.sort((a, b) => a.orden - b.orden)
}

export async function deleteWidget(id: string): Promise<void> {
  await api.delete(`/widgets/${id}`)
}

export interface WidgetOrdenItem {
  id:    string
  orden: number
}

export async function updateWidgetOrden(items: WidgetOrdenItem[]): Promise<void> {
  await api.patch('/widgets/orden', items)
}

export async function createWidget(payload: CreateWidgetPayload): Promise<WidgetDTO> {
  const body = {
    titulo:           payload.titulo,
    tipoId:           TIPO_ID_MAP[payload.tipo],
    queryConfig:      JSON.stringify(payload.queryConfig),
    orden:            payload.orden,
    tipoSemantico:    payload.tipoSemantico   ?? null,
    nivelGeografico:  payload.nivelGeografico ?? null,
  }
  const res = await api.post<WidgetDTO>('/widgets', body)
  return res.data
}