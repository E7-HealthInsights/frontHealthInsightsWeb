import api from '../lib/api'

export interface DatasetOption {
  id:          string
  nombre:      string
  nombreTabla: string
  descripcion: string
  fuente:      string
}

export interface MetricaOption {
  id:         string
  nombre:     string
  columnaCsv: string
  unidad:     string | null
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

export type DatasetEstado = 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR'

export interface DatasetStatusResponse {
  id:           string
  estado:       DatasetEstado
  errorMensaje: string
}

/** Respuesta del 202 al hacer upload */
export interface UploadAcceptedResponse {
  id:      string
  estado:  DatasetEstado
  nombre:  string
  message: string
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getDatasets(): Promise<DatasetOption[]> {
  const res = await api.get<DatasetOption[]>('/datasets')
  return res.data
}

export async function getMetricasByDataset(datasetId: string): Promise<MetricaOption[]> {
  const res = await api.get<MetricaOption[]>(`/datasets/${datasetId}/metricas`)
  return res.data
}

export interface ValoresDistintosResponse {
  valores: string[]
  total:   number
}

/**
 * Obtiene hasta 50 valores distintos de una columna para mostrar en el filtro.
 * Si total <= 50 → dropdown; si total == 50 → input libre (puede haber más valores).
 */
export async function getValoresDistintos(
  datasetId: string,
  columna:   string,
): Promise<ValoresDistintosResponse> {
  const res = await api.get<ValoresDistintosResponse>(
    `/datasets/${datasetId}/metricas/${columna}/valores-distintos`
  )
  return res.data
}

/**
 * Consulta el estado de procesamiento de un dataset.
 * Se usa en el loop de polling mientras el ingest está en curso.
 */
export async function getDatasetStatus(datasetId: string): Promise<DatasetStatusResponse> {
  const res = await api.get<DatasetStatusResponse>(`/datasets/${datasetId}/status`)
  return res.data
}

// ── Upload ────────────────────────────────────────────────────────────────────

/**
 * Sube un CSV con su metadata al backend.
 *
 * El backend responde 202 Accepted con el id del dataset creado.
 * El ingest real ocurre de forma asíncrona — usar {@link pollDatasetStatus}
 * para saber cuándo terminó.
 */
export async function uploadDataset(payload: UploadDatasetPayload): Promise<UploadAcceptedResponse> {
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

  const res = await api.post<UploadAcceptedResponse>('/datasets/upload', body, {
    timeout: 30_000, // solo sube a GCS y publica Kafka — mucho más rápido que antes
  })
  return res.data
}

/**
 * Hace polling a /datasets/{id}/status hasta que el estado sea READY o ERROR.
 *
 * @param datasetId  id del dataset a monitorear
 * @param onStatus   callback llamado con cada respuesta de status
 * @param intervalMs intervalo de polling en milisegundos (default: 3000)
 * @param timeoutMs  timeout total antes de abortar (default: 5 minutos)
 * @returns el status final (READY o ERROR)
 */
export function pollDatasetStatus(
  datasetId:  string,
  onStatus:   (status: DatasetStatusResponse) => void,
  intervalMs: number = 3000,
  timeoutMs:  number = 5 * 60 * 1000
): Promise<DatasetStatusResponse> {
  return new Promise((resolve, reject) => {
    const start  = Date.now()
    let timerId: ReturnType<typeof setInterval>

    const check = async () => {
      // Timeout total
      if (Date.now() - start > timeoutMs) {
        clearInterval(timerId)
        reject(new Error('El procesamiento del dataset superó el tiempo máximo de espera.'))
        return
      }

      try {
        const status = await getDatasetStatus(datasetId)
        onStatus(status)

        if (status.estado === 'READY' || status.estado === 'ERROR') {
          clearInterval(timerId)
          resolve(status)
        }
      } catch (err) {
        // No abortar en errores transitorios de red — solo loguear
        console.warn('Error en polling de status, reintentando...', err)
      }
    }

    // Primera consulta inmediata, luego cada intervalMs
    check()
    timerId = setInterval(check, intervalMs)
  })
}

// ── Utilidad privada ──────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo CSV'))
    reader.readAsDataURL(file)
  })
}
