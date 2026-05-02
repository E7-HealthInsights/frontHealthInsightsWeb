


export type WidgetTipo =
  | 'stat'
  | 'bar'
  | 'line'
  | 'pie'
  | 'tabla'

export interface Widget {
  id:          string
  title:       string
  subtitle?:   string
  tipo:        WidgetTipo
  isDefault:   boolean     // true = widget del rol, false = personal del usuario
  // El backend ya ejecutó la query y devuelve los datos listos:
  data:        WidgetData
}

// Stat card — un solo valor
export interface StatData {
  value:    string | number
  unit?:    string
  context?: string          // ej: "vs 2011: $815"
}

// Chart — array de puntos
export type ChartData = Record<string, string | number>[]

export type WidgetData = StatData | ChartData

// Mock: eliminar cuando el endpoint GET /widgets/my-widgets esté listo

const MOCK_WIDGETS: Widget[] = [
  // Default del rol
  {
    id:        'w-default-1',
    title:     'Gasto total en diabetes',
    subtitle:  'IDF Diabetes Atlas · México 2024',
    tipo:      'stat',
    isDefault: true,
    data:      { value: '$19,539.1M', unit: 'USD millones', context: 'Proyección 2050: $23,540M' },
  },
  {
    id:        'w-default-2',
    title:     'Gasto per cápita',
    subtitle:  'IDF Diabetes Atlas · México 2024',
    tipo:      'stat',
    isDefault: true,
    data:      { value: '$1,438', unit: 'USD por persona', context: 'En 2011 era $815' },
  },
  {
    id:        'w-default-3',
    title:     'Personas con diabetes',
    subtitle:  'IDF Diabetes Atlas · México 2024',
    tipo:      'stat',
    isDefault: true,
    data:      { value: '13,587.4k', unit: 'miles de personas', context: '41.3% no diagnosticadas' },
  },
  {
    id:        'w-default-4',
    title:     'Gasto histórico per cápita',
    subtitle:  'Evolución 2011–2024',
    tipo:      'bar',
    isDefault: true,
    data:      [
      { year: '2011', value: 815  },
      { year: '2024', value: 1438 },
      { year: '2050', value: 1180 },
    ],
  },

  // Personales del usuario
  {
    id:        'w-personal-1',
    title:     'Casos por estado',
    subtitle:  'Dataset personalizado',
    tipo:      'bar',
    isDefault: false,
    data:      [
      { estado: 'Jalisco',    casos: 142 },
      { estado: 'CDMX',       casos: 310 },
      { estado: 'Tabasco',    casos: 88  },
      { estado: 'Nuevo León', casos: 195 },
    ],
  },
]


export async function getMyWidgets(): Promise<Widget[]> {
  // cuando el endpoint esté listo y borrar el mock
  // const res = await api.get<Widget[]>('/widgets/my-widgets')
  // return res.data

  // Mock temporal
  await new Promise(r => setTimeout(r, 600))   
  return MOCK_WIDGETS
}

export async function deleteWidget(id: string): Promise<void> {
  // conectar con DELETE /widgets/:id
  // await api.delete(`/widgets/${id}`)
  console.log('deleteWidget mock:', id)
}