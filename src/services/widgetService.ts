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

export type WidgetData = ChartWidgetData | StatWidgetData | ErrorWidgetData

// Tipos d widgerts

export type WidgetTipo = 'STAT' | 'LINE' | 'BAR' | 'PIE'

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




export async function getMyWidgets(): Promise<WidgetDTO[]> {
  const res = await api.get<WidgetDTO[]>('/widgets')
  return res.data.sort((a, b) => a.orden - b.orden)
}
