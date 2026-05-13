import api from "../lib/api"


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
  data:       Record<string, string | number>[]
}

export interface HeatmapWidgetData {
  rows: Record<string, string | number>[]
}

export type WidgetData = ChartWidgetData | StatWidgetData | ErrorWidgetData | MultiSeriesWidgetData | HeatmapWidgetData
  data:       MultiSeriesPoint[]
}

export type TableRow = Record<string, string | number | null>

export interface TableWidgetData {
  columns: string[]
  rows:    TableRow[]
}

export interface ErrorWidgetData {
  error: string
}


// Tipos d widgets

export type WidgetTipo = 'STAT' | 'LINE' | 'BAR' | 'PIE' | 'MULTISERIES' | 'MULTIBAR' | 'HEATMAP'

export interface WidgetDTO {
  id:     string
  orden:  number
  titulo: string
  subtitulo?:  string
  seriesName?: string
  xAxisLabel?:  string
  yAxisLabel?:  string
  tipo:   WidgetTipo
  data:   WidgetData
}

// data types

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

export const isMultiSeriesData = (d: WidgetData): d is MultiSeriesWidgetData =>
  'seriesKeys' in d && 'data' in d

export const isHeatmapData = (d: WidgetData): d is HeatmapWidgetData =>
  'rows' in d && Array.isArray((d as HeatmapWidgetData).rows)


export async function getMyWidgets(): Promise<WidgetDTO[]> {
  const res = await api.get<WidgetDTO[]>('/widgets')
  return res.data.sort((a, b) => a.orden - b.orden)
}
