// Tipos de elemento que puede generar el usuario
export type ElementType = 'indicador' | 'grafica' | 'mapa' | 'tabla'

// Subtipos de gráfica
export type ChartSubtype = 'card' | 'barras' | 'lineas' | 'pastel' | 'dispersion' | 'tabla'

// Valor seleccionado para un parámetro (slot)
export interface ParamValue {
  slotKey: string   // e.g. "eje_x"
  column:  string   // columna del dataset elegida
}

// Payload que llega del GenerateElementModal al confirmar
export interface GeneratePayload {
  dataSource: string      // id del dataset
  chartType:  ChartSubtype
  params:     ParamValue[]
  title:      string
}

// Widget ya generado, vive en el dashboard
export interface DashboardWidget {
  id:         string
  title:      string
  dataSource: string
  chartType:  ChartSubtype
  params:     ParamValue[]
  // vendran del backend; por ahora mock
  data?:      Record<string, string | number>[]
}