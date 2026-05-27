// src/components/features/projections/FinanzasProyeccionModal/__tests__/FinanzasProyeccionModal.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                    from '@testing-library/user-event'
import FinanzasProyeccionModal      from '../FinanzasProyeccionModal'
import type { Proyeccion }          from '../../../../../types/Proyeccion'
import type { FinanzasResultado }   from '../../../../../types/FinanzasProyeccion'

// ── Mocks ──────────────────────────────────────────────────────────────────

// Debounce sincrónico — el API se llama de inmediato en tests
jest.mock('lodash', () => ({
  debounce: (fn: Function) => {
    const wrapped = (...args: unknown[]) => fn(...args)
    wrapped.cancel = jest.fn()
    return wrapped
  },
}))

// ✅ El primer argumento de jest.mock SIEMPRE es un string con el path del módulo
jest.mock('../../../../../services/proyeccionService', () => ({
  simularFinanzas: jest.fn(),
}))

import { simularFinanzas } from '../../../../../services/proyeccionService'

// ── Fixtures ──────────────────────────────────────────────────────────────

const mockSimulacion = {
  puntos: [
    { año: 2025, sinIntervencion: 16.4,  conIntervencion: 16.4  },
    { año: 2040, sinIntervencion: 22.4,  conIntervencion: 21.12 },
  ],
  kpis: {
    reduccionPct:        -5.7,
    casosEvitados:       1_088_000,
    ahorroEstimadoUSD_M: 1_565,
    ROI:                 0.91,
  },
}

const mockProyeccionToEdit: Proyeccion = {
  id:            'fin-edit-001',
  titulo:        'Escenario existente',
  descripcion:   'Descripción existente',
  fechaCreacion: '2026-05-01T10:00:00',
  resultado: {
    tipo: 'FINANZAS',
    params: {
      presupuestoTotalMillones: 3000,
      distribucion: { NUTRICION: 40, MEDICAMENTOS: 20, DETECCION: 20, ATENCION: 20 },
      periodoInicio: 2025,
      periodoFin:    2035,
    },
    puntos: [{ año: 2035, sinIntervencion: 20.1, conIntervencion: 18.5 }],
    kpis:   { reduccionPct: -8.0, casosEvitados: 1_300_000, ahorroEstimadoUSD_M: 1_869, ROI: 1.3 },
  } as FinanzasResultado,
}

// ── Helper ────────────────────────────────────────────────────────────────

const renderModal = (overrides = {}) => {
  const props = {
    isOpen:  true,
    onClose: jest.fn(),
    onSave:  jest.fn().mockResolvedValue(undefined),
    saving:  false,
    ...overrides,
  }
  render(<FinanzasProyeccionModal {...props} />)
  return props
}

// ── Tests — modo creación ─────────────────────────────────────────────────

describe('FinanzasProyeccionModal — modo creación', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularFinanzas as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  test('renderiza el título correcto', async () => {
    renderModal()
    await waitFor(() =>
      expect(screen.getByText(/nueva proyección de finanzas/i)).toBeInTheDocument()
    )
  })

  test('renderiza el campo de nombre del escenario', () => {
    renderModal()
    expect(screen.getByPlaceholderText(/inversión prioritaria/i)).toBeInTheDocument()
  })

  test('renderiza los 4 rubros de distribución', () => {
    renderModal()
    expect(screen.getByText('Educación nutricional')).toBeInTheDocument()
    expect(screen.getByText('Medicamentos preventivos')).toBeInTheDocument()
    expect(screen.getByText('Detección temprana')).toBeInTheDocument()
    expect(screen.getByText('Atención primaria')).toBeInTheDocument()
  })

  test('renderiza los 4 botones de período', () => {
    renderModal()
    ;[2030, 2035, 2040, 2050].forEach(p =>
      expect(screen.getByRole('button', { name: String(p) })).toBeInTheDocument()
    )
  })

  test('llama a simularFinanzas al abrir con valores default', async () => {
    renderModal()
    await waitFor(() =>
      expect(simularFinanzas).toHaveBeenCalledWith(
        expect.objectContaining({ presupuesto: 2000, hasta: 2040 })
      )
    )
  })

  test('muestra los KPIs cuando llega la simulación', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByText('-5.7%')).toBeInTheDocument()
      expect(screen.getByText('~1.1M')).toBeInTheDocument()
      expect(screen.getByText('0.91x')).toBeInTheDocument()
    })
  })

  test('llama a simularFinanzas al cambiar período', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: '2050' }))

    await waitFor(() =>
      expect(simularFinanzas).toHaveBeenCalledWith(
        expect.objectContaining({ hasta: 2050 })
      )
    )
  })

  test('muestra error si se guarda sin título', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    expect(screen.getByText('El título es obligatorio.')).toBeInTheDocument()
  })

  test('NO llama a onSave si no hay título', async () => {
    const user       = userEvent.setup({ delay: null })
    const { onSave } = renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  test('llama a onSave con resultado correcto al guardar', async () => {
    const user       = userEvent.setup({ delay: null })
    const { onSave } = renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.type(screen.getByPlaceholderText(/inversión prioritaria/i), 'Mi escenario')
    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        'Mi escenario',
        '',
        expect.objectContaining({
          tipo:   'FINANZAS',
          puntos: mockSimulacion.puntos,
          kpis:   mockSimulacion.kpis,
        })
      )
    )
  })

  test('llama a onClose al hacer clic en Cancelar', async () => {
    const user        = userEvent.setup({ delay: null })
    const { onClose } = renderModal()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('no renderiza nada cuando isOpen es false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText(/nueva proyección de finanzas/i)).not.toBeInTheDocument()
  })

})

// ── Tests — modo edición ──────────────────────────────────────────────────

describe('FinanzasProyeccionModal — modo edición', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularFinanzas as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  test('renderiza el título de edición', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByText(/editar proyección de finanzas/i)).toBeInTheDocument()
    )
  })

  test('pre-llena el nombre con el título existente', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByDisplayValue('Escenario existente')).toBeInTheDocument()
    )
  })

  test('pre-llena la descripción existente', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByDisplayValue('Descripción existente')).toBeInTheDocument()
    )
  })

  test('NO llama a simularFinanzas al abrir en modo edición', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByText(/editar proyección de finanzas/i)).toBeInTheDocument()
    )
    expect(simularFinanzas).not.toHaveBeenCalled()
  })

  test('el botón dice "Actualizar cambios"', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /actualizar cambios/i })).toBeInTheDocument()
    )
  })

  test('llama a onSave con el título editado', async () => {
    const user       = userEvent.setup({ delay: null })
    const { onSave } = renderModal({ proyeccionToEdit: mockProyeccionToEdit })

    const input = await screen.findByDisplayValue('Escenario existente')
    await user.clear(input)
    await user.type(input, 'Escenario modificado')
    await user.click(screen.getByRole('button', { name: /actualizar cambios/i }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        'Escenario modificado',
        expect.any(String),
        expect.objectContaining({ tipo: 'FINANZAS' })
      )
    )
  })

  test('SÍ llama a simularFinanzas cuando el usuario cambia el período en edición', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByText(/editar proyección de finanzas/i)).toBeInTheDocument()
    )
    expect(simularFinanzas).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '2050' }))

    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())
  })

})