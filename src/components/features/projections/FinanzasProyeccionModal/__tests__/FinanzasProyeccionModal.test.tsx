// src/components/features/proyecciones/__tests__/FinanzasProyeccionModal.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                    from '@testing-library/user-event'
import FinanzasProyeccionModal      from '../FinanzasProyeccionModal'
import { Proyeccion } from '../../../../../types/Proyeccion'
import { FinanzasResultado } from '../../../../../types/FinanzasProyeccion'
import { simularFinanzas } from '../../../../../services/proyeccionService'


// ── Mocks ──────────────────────────────────────────────────────────────────

// Debounce sincrónico para que el API se llame de inmediato en tests
jest.mock('lodash/debounce', () => (fn: (...args: unknown[]) => unknown) => fn)

jest.mock('../../../../services/proyeccionService', () => ({
    simularFinanzas: jest.fn(),
  }))


// Recharts requiere dimensiones — stub de ResizeObserver ya está en setupTests

// ── Fixtures ──────────────────────────────────────────────────────────────

const mockSimulacion = {
  puntos: [
    { año: 2025, sinIntervencion: 16.4,  conIntervencion: 16.4  },
    { año: 2040, sinIntervencion: 22.4,  conIntervencion: 21.12 },
  ],
  kpis: {
    reduccionPct: -5.7, casosEvitados: 1_088_000,
    ahorroEstimadoUSD_M: 1565, ROI: 0.91,
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
    kpis:  { reduccionPct: -8.0, casosEvitados: 1_300_000, ahorroEstimadoUSD_M: 1869, ROI: 1.3 },
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

// ── Tests ─────────────────────────────────────────────────────────────────

describe('FinanzasProyeccionModal — modo creación', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularFinanzas as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  // ── Renderizado ────────────────────────────────────────────────────────

  test('renderiza el título "Nueva Proyección"', async () => {
    renderModal()
    await waitFor(() => expect(screen.getByText('Nueva Proyección')).toBeInTheDocument())
  })

  test('renderiza el campo de nombre del escenario', async () => {
    renderModal()
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/inversión prioritaria/i)).toBeInTheDocument()
    )
  })

  test('renderiza los 4 rubros de distribución', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByText('Educación nutricional')).toBeInTheDocument()
      expect(screen.getByText('Medicamentos preventivos')).toBeInTheDocument()
      expect(screen.getByText('Detección temprana')).toBeInTheDocument()
      expect(screen.getByText('Atención primaria')).toBeInTheDocument()
    })
  })

  test('renderiza los 4 botones de período', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '2030' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2035' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2040' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2050' })).toBeInTheDocument()
    })
  })

  test('llama a simularFinanzas al abrir con valores default', async () => {
    renderModal()
    await waitFor(() => {
      expect(simularFinanzas).toHaveBeenCalledWith(
        expect.objectContaining({ presupuesto: 2000, hasta: 2040 })
      )
    })
  })

  // ── KPIs en tiempo real ────────────────────────────────────────────────

  test('muestra los KPIs una vez que llega la simulación', async () => {
    renderModal()
    await waitFor(() => {
      expect(screen.getByText('-5.7%')).toBeInTheDocument()
      expect(screen.getByText('~1.1M')).toBeInTheDocument()
      expect(screen.getByText('$1,565M')).toBeInTheDocument()
      expect(screen.getByText('0.91x')).toBeInTheDocument()
    })
  })

  // ── Interacciones ──────────────────────────────────────────────────────

  test('llama a simularFinanzas al cambiar período', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()

    await user.click(screen.getByRole('button', { name: '2050' }))

    await waitFor(() => {
      expect(simularFinanzas).toHaveBeenCalledWith(
        expect.objectContaining({ hasta: 2050 })
      )
    })
  })

  // ── Validación ─────────────────────────────────────────────────────────

  test('muestra error si se intenta guardar sin título', async () => {
    const user = userEvent.setup({ delay: null })
    renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    expect(screen.getByText('El título es obligatorio.')).toBeInTheDocument()
  })

  test('NO llama a onSave si no hay título', async () => {
    const user    = userEvent.setup({ delay: null })
    const { onSave } = renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  // ── Guardar ────────────────────────────────────────────────────────────

  test('llama a onSave con título, descripción y resultado correcto', async () => {
    const user    = userEvent.setup({ delay: null })
    const { onSave } = renderModal()
    await waitFor(() => expect(simularFinanzas).toHaveBeenCalled())

    await user.type(screen.getByPlaceholderText(/inversión prioritaria/i), 'Mi escenario')
    await user.click(screen.getByRole('button', { name: /guardar escenario/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        'Mi escenario',
        '',
        expect.objectContaining({
          tipo:   'FINANZAS',
          puntos: mockSimulacion.puntos,
          kpis:   mockSimulacion.kpis,
        })
      )
    })
  })

  // ── Cancelar ──────────────────────────────────────────────────────────

  test('llama a onClose al hacer clic en Cancelar', async () => {
    const user    = userEvent.setup({ delay: null })
    const { onClose } = renderModal()

    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('no renderiza nada cuando isOpen es false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByText('Nueva Proyección')).not.toBeInTheDocument()
  })

})

// ── Modo edición ──────────────────────────────────────────────────────────

describe('FinanzasProyeccionModal — modo edición', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularFinanzas as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  test('renderiza el título "Editar Proyección"', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() => expect(screen.getByText('Editar Proyección')).toBeInTheDocument())
  })

  test('pre-llena el campo de nombre con el título existente', async () => {
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
    await waitFor(() => expect(screen.getByText('Editar Proyección')).toBeInTheDocument())
    expect(simularFinanzas).not.toHaveBeenCalled()
  })

  test('el botón de guardar dice "Actualizar escenario"', async () => {
    renderModal({ proyeccionToEdit: mockProyeccionToEdit })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /actualizar escenario/i })).toBeInTheDocument()
    )
  })

  test('llama a onSave con el título editado', async () => {
    const user    = userEvent.setup({ delay: null })
    const { onSave } = renderModal({ proyeccionToEdit: mockProyeccionToEdit })

    const input = await screen.findByDisplayValue('Escenario existente')
    await user.clear(input)
    await user.type(input, 'Escenario modificado')
    await user.click(screen.getByRole('button', { name: /actualizar escenario/i }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        'Escenario modificado',
        expect.any(String),
        expect.objectContaining({ tipo: 'FINANZAS' })
      )
    })
  })

})