import api from '../lib/api'

export interface DatasetOption {
  id:          string
  nombre:      string
  descripcion: string
  fuente:      string
}

export interface MetricaOption {
  id:        string
  nombre:    string
  columnaCsv: string
  unidad:    string | null
}

export async function getDatasets(): Promise<DatasetOption[]> {
  const res = await api.get<DatasetOption[]>('/datasets')
  return res.data
}

export async function getMetricasByDataset(datasetId: string): Promise<MetricaOption[]> {
  const res = await api.get<MetricaOption[]>(`/datasets/${datasetId}/metricas`)
  return res.data
}