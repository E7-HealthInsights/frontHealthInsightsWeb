// src/services/__tests__/proyeccionService.test.ts

import {
    simularFinanzas,
    simularGeneral,
    getProyecciones,
    saveProyeccion,
    updateProyeccion,
    deleteProyeccion,
  } from '../proyeccionService'
  import api from '../../lib/api'
  import type { FinanzasResultado } from '../../types/FinanzasProyeccion'
  import type { GeneralResultado }  from '../../types/GeneralProyeccion'
  
  // ── Mocks ──────────────────────────────────────────────────────────────────
  
  jest.mock('../../lib/api', () => ({
    __esModule: true,
    default: {
      get:    jest.fn(),
      post:   jest.fn(),
      patch:  jest.fn(),
      delete: jest.fn(),
    },
  }))
  
  // ── Fixtures ──────────────────────────────────────────────────────────────
  
  const mockPuntosFinanzas = [
    { año: 2025, sinIntervencion: 16.4,  conIntervencion: 16.4  },
    { año: 2040, sinIntervencion: 22.4,  conIntervencion: 21.12 },
  ]
  
  const mockKpisFinanzas = {
    reduccionPct: -5.7, casosEvitados: 1_088_000,
    ahorroEstimadoUSD_M: 1565, ROI: 0.91,
  }
  
  const mockSimulacionFinanzas = { puntos: mockPuntosFinanzas, kpis: mockKpisFinanzas }
  
  const mockPuntosGeneral = [
    { año: 2025, sinIntervencion: 13.59, conIntervencion: 13.59 },
    { año: 2035, sinIntervencion: 16.5,  conIntervencion: 15.2  },
  ]
  
  const mockKpisGeneral = {
    casosProyectados2050: 16.5, casosEvitados: 1.3, reduccionPorcentual: -7.9,
  }
  
  const mockSimulacionGeneral = { puntos: mockPuntosGeneral, kpis: mockKpisGeneral }
  
  const mockResultadoFinanzas: FinanzasResultado = {
    tipo: 'FINANZAS',
    params: {
      presupuestoTotalMillones: 2000,
      distribucion: { NUTRICION: 25, MEDICAMENTOS: 25, DETECCION: 25, ATENCION: 25 },
      periodoInicio: 2025, periodoFin: 2040,
    },
    puntos: mockPuntosFinanzas,
    kpis:   mockKpisFinanzas,
  }
  
  const mockProyeccionDTO = {
    id:            'uuid-123',
    titulo:        'Escenario test',
    descripcion:   'Desc test',
    fechaCreacion: '2026-05-01T10:00:00',
    resultado:     JSON.stringify(mockResultadoFinanzas),
  }
  
  // ── simularFinanzas ────────────────────────────────────────────────────────
  
  describe('simularFinanzas', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('llama al endpoint correcto con los query params', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSimulacionFinanzas })
  
      await simularFinanzas({
        presupuesto: 2000, nutricion: 30,
        medicamentos: 25, deteccion: 25, atencion: 20, hasta: 2040,
      })
  
      expect(api.get).toHaveBeenCalledWith(
        '/proyecciones/simular/finanzas',
        { params: { presupuesto: 2000, nutricion: 30, medicamentos: 25, deteccion: 25, atencion: 20, hasta: 2040 } }
      )
    })
  
    test('devuelve puntos y kpis del backend', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSimulacionFinanzas })
  
      const result = await simularFinanzas({
        presupuesto: 2000, nutricion: 25,
        medicamentos: 25, deteccion: 25, atencion: 25, hasta: 2040,
      })
  
      expect(result.puntos).toHaveLength(2)
      expect(result.kpis.reduccionPct).toBe(-5.7)
      expect(result.kpis.ROI).toBe(0.91)
    })
  
    test('lanza error si el API falla', async () => {
      ;(api.get as jest.Mock).mockRejectedValue(new Error('Network Error'))
  
      await expect(simularFinanzas({
        presupuesto: 1000, nutricion: 25,
        medicamentos: 25, deteccion: 25, atencion: 25, hasta: 2035,
      })).rejects.toThrow('Network Error')
    })
  
  })
  
  // ── simularGeneral ─────────────────────────────────────────────────────────
  
  describe('simularGeneral', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('llama al endpoint correcto con los query params', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSimulacionGeneral })
  
      await simularGeneral({
        tasaCrecimiento: 2.1, intensidadPolitica: 20, inicio: 2025, hasta: 2035,
      })
  
      expect(api.get).toHaveBeenCalledWith(
        '/proyecciones/simular/general',
        { params: { tasaCrecimiento: 2.1, intensidadPolitica: 20, inicio: 2025, hasta: 2035 } }
      )
    })
  
    test('devuelve puntos y kpis del backend', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSimulacionGeneral })
  
      const result = await simularGeneral({
        tasaCrecimiento: 2.1, intensidadPolitica: 0, inicio: 2025, hasta: 2035,
      })
  
      expect(result.puntos).toHaveLength(2)
      expect(result.kpis.casosEvitados).toBe(1.3)
      expect(result.kpis.reduccionPorcentual).toBe(-7.9)
    })
  
    test('con intensidadPolitica=0 las dos curvas son iguales en el año inicial', async () => {
      const sinIntervencion = { ...mockSimulacionGeneral }
      sinIntervencion.puntos = [
        { año: 2025, sinIntervencion: 13.59, conIntervencion: 13.59 },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: sinIntervencion })
  
      const result = await simularGeneral({
        tasaCrecimiento: 2.1, intensidadPolitica: 0, inicio: 2025, hasta: 2025,
      })
  
      expect(result.puntos[0].sinIntervencion).toBe(result.puntos[0].conIntervencion)
    })
  
  })
  
  // ── getProyecciones ────────────────────────────────────────────────────────
  
  describe('getProyecciones', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('devuelve lista de proyecciones parseadas', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [mockProyeccionDTO] })
  
      const result = await getProyecciones()
  
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('uuid-123')
      expect(result[0].resultado.tipo).toBe('FINANZAS')
    })
  
    test('parsea el campo resultado de JSON string a objeto', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [mockProyeccionDTO] })
  
      const result = await getProyecciones()
      const r = result[0].resultado as FinanzasResultado
  
      expect(r.params.presupuestoTotalMillones).toBe(2000)
      expect(r.kpis.ROI).toBe(0.91)
    })
  
    test('devuelve array vacío si no hay proyecciones', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [] })
  
      const result = await getProyecciones()
      expect(result).toHaveLength(0)
    })
  
  })
  
  // ── saveProyeccion ─────────────────────────────────────────────────────────
  
  describe('saveProyeccion', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('llama a POST /proyecciones con los campos correctos', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: mockProyeccionDTO })
  
      await saveProyeccion('Mi escenario', 'Descripción', mockResultadoFinanzas)
  
      expect(api.post).toHaveBeenCalledWith('/proyecciones', {
        titulo:      'Mi escenario',
        descripcion: 'Descripción',
        resultado:   JSON.stringify(mockResultadoFinanzas),
      })
    })
  
    test('serializa el resultado como JSON string', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: mockProyeccionDTO })
  
      await saveProyeccion('Test', '', mockResultadoFinanzas)
  
      const body = (api.post as jest.Mock).mock.calls[0][1]
      expect(typeof body.resultado).toBe('string')
      expect(JSON.parse(body.resultado).tipo).toBe('FINANZAS')
    })
  
    test('devuelve la proyección creada con resultado parseado', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: mockProyeccionDTO })
  
      const result = await saveProyeccion('Test', '', mockResultadoFinanzas)
  
      expect(result.id).toBe('uuid-123')
      expect(result.resultado.tipo).toBe('FINANZAS')
    })
  
  })
  
  // ── updateProyeccion ───────────────────────────────────────────────────────
  
  describe('updateProyeccion', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('llama a PATCH /proyecciones/{id}', async () => {
      ;(api.patch as jest.Mock).mockResolvedValue({ data: mockProyeccionDTO })
  
      await updateProyeccion('uuid-123', 'Título editado', 'Nueva desc', mockResultadoFinanzas)
  
      expect(api.patch).toHaveBeenCalledWith(
        '/proyecciones/uuid-123',
        expect.objectContaining({ titulo: 'Título editado', descripcion: 'Nueva desc' })
      )
    })
  
    test('NO llama a PUT — usa PATCH', async () => {
      ;(api.patch as jest.Mock).mockResolvedValue({ data: mockProyeccionDTO })
  
      await updateProyeccion('uuid-123', 'Test', '', mockResultadoFinanzas)
  
      expect(api.patch).toHaveBeenCalledTimes(1)
      expect((api as any).put).toBeUndefined()
    })
  
    test('devuelve la proyección actualizada con resultado parseado', async () => {
      const updated = { ...mockProyeccionDTO, titulo: 'Título editado' }
      ;(api.patch as jest.Mock).mockResolvedValue({ data: updated })
  
      const result = await updateProyeccion('uuid-123', 'Título editado', '', mockResultadoFinanzas)
  
      expect(result.titulo).toBe('Título editado')
      expect(result.resultado.tipo).toBe('FINANZAS')
    })
  
  })
  
  // ── deleteProyeccion ───────────────────────────────────────────────────────
  
  describe('deleteProyeccion', () => {
  
    beforeEach(() => jest.clearAllMocks())
  
    test('llama a DELETE /proyecciones/{id}', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({})
  
      await deleteProyeccion('uuid-123')
  
      expect(api.delete).toHaveBeenCalledWith('/proyecciones/uuid-123')
    })
  
    test('no devuelve nada (void)', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({})
  
      const result = await deleteProyeccion('uuid-123')
  
      expect(result).toBeUndefined()
    })
  
  })