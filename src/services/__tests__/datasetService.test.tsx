import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDatasets, getMetricasByDataset, uploadDataset } from '../datasetService'
import api from '../../lib/api'

// Mock del módulo axios instance completo
vi.mock('../../lib/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}))

const apiMock = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> }

describe('datasetService', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── getDatasets ────────────────────────────────────────────────────────────

  describe('getDatasets', () => {
    it('returns the list from the API', async () => {
      const mockData = [
        { id: '1', nombre: 'Diabetes 2023', descripcion: 'Desc', fuente: 'INEGI' },
        { id: '2', nombre: 'Obesidad 2022', descripcion: 'Desc', fuente: 'SSA'   },
      ]
      apiMock.get.mockResolvedValueOnce({ data: mockData })

      const result = await getDatasets()

      expect(apiMock.get).toHaveBeenCalledWith('/datasets')
      expect(result).toHaveLength(2)
      expect(result[0].nombre).toBe('Diabetes 2023')
    })

    it('returns empty array when API returns empty list', async () => {
      apiMock.get.mockResolvedValueOnce({ data: [] })

      const result = await getDatasets()

      expect(result).toEqual([])
    })

    it('propagates API errors', async () => {
      apiMock.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(getDatasets()).rejects.toThrow('Network error')
    })
  })

  // ── getMetricasByDataset ───────────────────────────────────────────────────

  describe('getMetricasByDataset', () => {
    const datasetId = 'e1000000-0000-0000-0000-000000000001'

    it('calls the correct endpoint with the dataset id', async () => {
      apiMock.get.mockResolvedValueOnce({ data: [] })

      await getMetricasByDataset(datasetId)

      expect(apiMock.get).toHaveBeenCalledWith(`/datasets/${datasetId}/metricas`)
    })

    it('returns metricas with all fields', async () => {
      const mockMetricas = [
        { id: 'm1', nombre: 'Casos', columnaCsv: 'casos', unidad: null },
        { id: 'm2', nombre: 'Prevalencia', columnaCsv: 'prevalencia', unidad: '%' },
      ]
      apiMock.get.mockResolvedValueOnce({ data: mockMetricas })

      const result = await getMetricasByDataset(datasetId)

      expect(result).toHaveLength(2)
      expect(result[1].unidad).toBe('%')
    })
  })

  // ── uploadDataset ──────────────────────────────────────────────────────────

  describe('uploadDataset', () => {
    const buildPayload = () => ({
      file: new File(['estado,casos\nJalisco,100\n'], 'test_datos.csv', { type: 'text/csv' }),
      nombre: 'Test Dataset',
      descripcion: 'Descripción de prueba',
      fuente: 'INEGI',
      columnMappings: [
        { originalName: 'estado', displayName: 'Estado',  sqlType: 'VARCHAR(255)' },
        { originalName: 'casos',  displayName: 'Casos',   sqlType: 'INT'          },
      ],
    })

    it('calls POST /datasets/upload with JSON body', async () => {
      const mockResponse = { id: 'new-id', nombre: 'Test Dataset', descripcion: '', fuente: 'INEGI' }
      apiMock.post.mockResolvedValueOnce({ data: mockResponse })

      await uploadDataset(buildPayload())

      expect(apiMock.post).toHaveBeenCalledWith(
        '/datasets/upload',
        expect.objectContaining({
          nombre:        'Test Dataset',
          descripcion:   'Descripción de prueba',
          fuente:        'INEGI',
          archivoNombre: 'test_datos.csv',
        }),
        expect.objectContaining({ timeout: 60_000 })
      )
    })

    it('includes base64-encoded file content in the request body', async () => {
      apiMock.post.mockResolvedValueOnce({ data: {} })

      await uploadDataset(buildPayload())

      const body = apiMock.post.mock.calls[0][1]
      expect(typeof body.archivoCsvBase64).toBe('string')
      expect(body.archivoCsvBase64.length).toBeGreaterThan(0)
      // base64 solo contiene estos caracteres
      expect(body.archivoCsvBase64).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('maps columnMappings to the columnas array correctly', async () => {
      apiMock.post.mockResolvedValueOnce({ data: {} })

      await uploadDataset(buildPayload())

      const body = apiMock.post.mock.calls[0][1]
      expect(body.columnas).toHaveLength(2)
      expect(body.columnas[0]).toMatchObject({
        originalName: 'estado',
        displayName:  'Estado',
        sqlType:      'VARCHAR(255)',
      })
    })

    it('returns the created dataset from the API response', async () => {
      const mockDataset = { id: 'abc', nombre: 'Test Dataset', descripcion: '', fuente: 'INEGI' }
      apiMock.post.mockResolvedValueOnce({ data: mockDataset })

      const result = await uploadDataset(buildPayload())

      expect(result.id).toBe('abc')
      expect(result.nombre).toBe('Test Dataset')
    })

    it('propagates API errors', async () => {
      const error = Object.assign(new Error('Conflict'), {
        response: { status: 409, data: { message: 'Tabla duplicada' } },
      })
      apiMock.post.mockRejectedValueOnce(error)

      await expect(uploadDataset(buildPayload())).rejects.toThrow('Conflict')
    })
  })
})
