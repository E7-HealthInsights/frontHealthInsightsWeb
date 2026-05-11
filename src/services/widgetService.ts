import api from "../lib/api"


export interface ChartWidgetData {
  labels: (string | number)[]
  values: number[]
}

export interface StatWidgetData {
  value: number
  label?: string       
}

export interface ErrorWidgetData {
  error: string
}

export interface MultiSeriesWidgetData {
  seriesKeys: string[]
  data:       Record<string, string | number>[]  
}

export type WidgetData = ChartWidgetData | StatWidgetData | ErrorWidgetData | MultiSeriesWidgetData

// Tipos d widgerts

export type WidgetTipo = 'STAT' | 'LINE' | 'BAR' | 'PIE' | 'MULTISERIES'

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

export const isErrorData = (d: WidgetData): d is ErrorWidgetData =>
  'error' in d

export const isMultiSeriesData = (d: WidgetData): d is MultiSeriesWidgetData =>
  'seriesKeys' in d && 'data' in d


export async function getMyWidgets(): Promise<WidgetDTO[]> {
  const res = await api.get<WidgetDTO[]>('/widgets')
  return res.data.sort((a, b) => a.orden - b.orden)
}
