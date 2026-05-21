import api from '../lib/api'

export interface DatasetOption {
  id:          string
  nombre:      string
  nombreTabla: string   // nombre real de la tabla en BD, usado en queryConfig
  descripcion: string
  fuente:      string
}

export interface MetricaOption {
  id:        string
  nombre:    string
  columnaCsv: string
  unidad:    string | null
}

export interface ColumnMapping {
  originalName: string
  displayName:  string
  sqlType:      string
  unidad?:      string
}

export interface UploadDatasetPayload {
  file:           File
  nombre:         string
  descripcion:    string
  fuente:         string
  columnMappings: ColumnMapping[]
  justification:  string
}

export async function getDatasets(): Promise<DatasetOption[]> {
  const res = await api.get<DatasetOption[]>('/datasets')
  return res.data
}

export async function getMetricasByDataset(datasetId: string): Promise<MetricaOption[]> {
  const res = await api.get<MetricaOption[]>(`/datasets/${datasetId}/metricas`)
  return res.data
}

/**
 * Sube un CSV con su metadata y definición de columnas al backend.
 * El archivo se convierte a base64 y se envía como JSON puro,
 * evitando así la necesidad de multipart en el backend.
 */
export async function uploadDataset(payload: UploadDatasetPayload): Promise<DatasetOption> {
  // Convertir el File a base64
  const archivoCsvBase64 = await fileToBase64(payload.file)

  const body = {
    nombre:          payload.nombre,
    descripcion:     payload.descripcion ?? '',
    fuente:          payload.fuente ?? '',
    archivoNombre:   payload.file.name,
    archivoCsvBase64,
    justification:  payload.justification,
    columnas: payload.columnMappings.map(m => ({
      originalName: m.originalName,
      displayName:  m.displayName,
      sqlType:      m.sqlType,
      unidad:       m.unidad ?? null,
    })),
  }

  // Timeout mayor para CSVs grandes (60 s)
  const res = await api.post<DatasetOption>('/datasets/upload', body, {
    timeout: 60_000,
  })
  return res.data
}

// ── Utilidad privada ──────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => {
      const result = reader.result as string
      // El resultado es "data:text/csv;base64,XXXX..." — extraemos solo la parte base64
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo CSV'))
    reader.readAsDataURL(file)
  })
}