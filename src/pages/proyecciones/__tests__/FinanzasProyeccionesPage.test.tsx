// src/pages/proyecciones/__tests__/FinanzasProyeccionesPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                    from '@testing-library/user-event'
import { MemoryRouter }             from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FinanzasProyeccionesPage     from '../FinanzasProyeccionesPage'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user:    { name: 'Alejandra', role: 'DIRECTOR_FINANZAS' },
    setUser: jest.fn(),
  }),
}))

jest.mock('../../../services/authService', () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}))

// ✅ Debounce con .cancel para que el useEffect del modal no falle al desmontar
jest.mock('lodash', () => ({
  debounce: (fn: (...args: unknown[]) => unknown) => {
    const wrapped = (...args: unknown[]) => fn(...args)
    wrapped.cancel = jest.fn()
    return wrapped
  },
}))

// ✅ Mock de useGenerarPDF y jspdf para evitar el error de ESModules
jest.mock('../../../hooks/useGenerarPDF', () => ({
  useGenerarPDF: () => ({ generar: jest.fn().mockResolvedValue(undefined), generando: false }),
}))

jest.mock('../../../services/reportService', () => ({
  createReporte: jest.fn().mockResolvedValue({}),
}))

jest.mock('../../../services/proyeccionService', () => ({
  getProyecciones:  jest.fn(),
  saveProyeccion:   jest.fn(),
  updateProyeccion: jest.fn(),
  deleteProyeccion: jest.fn(),
  simularFinanzas:  jest.fn(),
}))

import {
  getProyecciones,
  deleteProyeccion,
  simularFinanzas,
} from '../../../services/proyeccionService'
import type { Proyeccion } from '../../../types/Proyeccion'

// ── Fixtures ──────────────────────────────────────────────────────────────

const mockProyeccion: Proyeccion = {
  id:            'fin-001',
  titulo:        'Escenario de prueba',
  descripcion:   'Descripción de prueba',
  fechaCreacion: '2026-05-01T10:00:00',
  resultado: {
    tipo: 'FINANZAS',
    params: {
      presupuestoTotalMillones: 2000,
      distribucion: { NUTRICION: 25, MEDICAMENTOS: 25, DETECCION: 25, ATENCION: 25 },
      periodoInicio: 2025, periodoFin: 2040,
    },
    puntos: [{ año: 2025, sinIntervencion: 16.4, conIntervencion: 16.4 }],
    kpis:   { reduccionPct: -5.7, casosEvitados: 1_088_000, ahorroEstimadoUSD_M: 1565, ROI: 0.91 },
  },
}

const mockSimulacion = {
  puntos: [{ año: 2025, sinIntervencion: 16.4, conIntervencion: 16.4 }],
  kpis:   { reduccionPct: -5.7, casosEvitados: 1_088_000, ahorroEstimadoUSD_M: 1565, ROI: 0.91 },
}

// ── Helper ────────────────────────────────────────────────────────────────

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FinanzasProyeccionesPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return queryClient
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('FinanzasProyeccionesPage', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularFinanzas as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  // ── Renderizado ────────────────────────────────────────────────────────

  test('muestra el encabezado de la página', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Mis Escenarios')).toBeInTheDocument()
    )
  })

  test('muestra el nombre del usuario', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/alejandra/i)).toBeInTheDocument()
    )
  })

  test('muestra spinner mientras carga', () => {
    ;(getProyecciones as jest.Mock).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  test('muestra mensaje vacío cuando no hay escenarios', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/crea tu primera proyección/i)).toBeInTheDocument()
    )
  })

  test('renderiza las cards de proyecciones', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Escenario de prueba')).toBeInTheDocument()
    )
  })

  test('muestra mensaje de error si falla el fetch', async () => {
    ;(getProyecciones as jest.Mock).mockRejectedValue(new Error('Network Error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument()
    )
  })

  // ── Navegación al detalle ──────────────────────────────────────────────

  // ✅ El botón en la card dice "Ver" no "Ver detalle"
  test('navega al detalle al hacer clic en Ver', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
    )
  })

  test('vuelve a la lista al hacer clic en Volver', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /volver/i }))

    await waitFor(() =>
      expect(screen.getByText('Mis Escenarios')).toBeInTheDocument()
    )
  })

  // ── FAB y modal de creación ────────────────────────────────────────────

  test('muestra el FAB en la vista de lista', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /nueva proyección/i })).toBeInTheDocument()
    )
  })

  test('abre el modal de nueva proyección al hacer clic en el FAB', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()

    await waitFor(() => expect(screen.getByRole('button', { name: /nueva proyección/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /nueva proyección/i }))

    await waitFor(() =>
      expect(screen.getByText(/nueva proyección de finanzas/i)).toBeInTheDocument()
    )
  })

  test('oculta el FAB cuando está en vista de detalle', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /nueva proyección/i })).not.toBeInTheDocument()
    })
  })

  // ── Eliminar ───────────────────────────────────────────────────────────

  test('abre el modal de confirmación de eliminación desde el detalle', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Eliminar escenario$/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^Eliminar escenario$/i }))

    await waitFor(() =>
      expect(screen.getByText(/¿eliminar escenario\?/i)).toBeInTheDocument()
    )
  })

  test('llama a deleteProyeccion al confirmar eliminación', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    ;(deleteProyeccion as jest.Mock).mockResolvedValue(undefined)
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Eliminar escenario$/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^Eliminar escenario$/i }))
    await waitFor(() => expect(screen.getByText(/¿eliminar escenario\?/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    await waitFor(() =>
      expect(deleteProyeccion).toHaveBeenCalled()
    )
  })

  test('vuelve a la lista después de eliminar desde el detalle', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock)
      .mockResolvedValueOnce([mockProyeccion])
      .mockResolvedValue([])
    ;(deleteProyeccion as jest.Mock).mockResolvedValue(undefined)
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Eliminar escenario$/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^Eliminar escenario$/i }))
    await waitFor(() => expect(screen.getByText(/¿eliminar escenario\?/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    await waitFor(() =>
      expect(screen.getByText('Mis Escenarios')).toBeInTheDocument()
    )
  })

  // ── Editar ─────────────────────────────────────────────────────────────

  test('abre el modal de edición al hacer clic en Editar desde el detalle', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Editar escenario$/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^Editar escenario$/i }))

    await waitFor(() =>
      expect(screen.getByText(/Editar proyección de finanzas/i)).toBeInTheDocument()
    )
  })

  test('el modal de edición pre-llena el título existente', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Escenario de prueba')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /^Editar escenario$/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^Editar escenario$/i }))

    await waitFor(() =>
      expect(screen.getByDisplayValue('Escenario de prueba')).toBeInTheDocument()
    )
  })

})