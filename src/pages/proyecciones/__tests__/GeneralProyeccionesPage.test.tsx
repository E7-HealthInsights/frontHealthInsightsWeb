// src/pages/proyecciones/__tests__/GeneralProyeccionesPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                    from '@testing-library/user-event'
import { MemoryRouter }             from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GeneralProyeccionesPage      from '../GeneralProyeccionesPage'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user:    { name: 'Carlos', role: 'DIRECTOR_GENERAL' },
    setUser: jest.fn(),
  }),
}))

jest.mock('../../../services/authService', () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}))

// ✅ Debounce con .cancel
jest.mock('lodash', () => ({
  debounce: (fn: (...args: unknown[]) => unknown) => {
    const wrapped = (...args: unknown[]) => fn(...args)
    wrapped.cancel = jest.fn()
    return wrapped
  },
}))

// ✅ Mock de useGenerarPDF y reportService para evitar el error de jspdf ESModules
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
  simularGeneral:   jest.fn(),
}))

import {
  getProyecciones,
  deleteProyeccion,
  simularGeneral,
} from '../../../services/proyeccionService'
import type { Proyeccion } from '../../../types/Proyeccion'

// ── Fixtures ──────────────────────────────────────────────────────────────

const mockProyeccion: Proyeccion = {
  id:            'gen-001',
  titulo:        'Plan Nacional 2035',
  descripcion:   'Proyección general de prueba',
  fechaCreacion: '2026-05-10T10:00:00',
  resultado: {
    tipo: 'GENERAL',
    params: {
      tasaCrecimiento:    2.1,
      intensidadPolitica: 30,
      periodoInicio:      2025,
      periodoFin:         2035,
    },
    puntos: [{ año: 2025, sinIntervencion: 13.59, conIntervencion: 13.59 }],
    kpis:   { casosProyectados2050: 16.5, casosEvitados: 2.1, reduccionPorcentual: -4.2 },
  },
}

const mockSimulacion = {
  puntos: [{ año: 2025, sinIntervencion: 13.59, conIntervencion: 13.59 }],
  kpis:   { casosProyectados2050: 16.5, casosEvitados: 2.1, reduccionPorcentual: -4.2 },
}

// ── Helper ────────────────────────────────────────────────────────────────

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GeneralProyeccionesPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return queryClient
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('GeneralProyeccionesPage', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    ;(simularGeneral as jest.Mock).mockResolvedValue(mockSimulacion)
  })

  // ── Renderizado ────────────────────────────────────────────────────────

  test('muestra el encabezado de la página', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Mis Escenarios')).toBeInTheDocument()
    )
  })

  test('muestra el nombre del usuario autenticado', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/carlos/i)).toBeInTheDocument()
    )
  })

  test('muestra estado vacío cuando no hay proyecciones', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/crea tu primer escenario/i)).toBeInTheDocument()
    )
  })

  test('renderiza las cards de proyecciones generales', async () => {
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument()
    )
  })

  test('muestra error si falla el fetch', async () => {
    ;(getProyecciones as jest.Mock).mockRejectedValue(new Error('Error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument()
    )
  })

  // ── Detalle ────────────────────────────────────────────────────────────

  test('navega al detalle al hacer clic en Ver', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
    )
  })

  test('vuelve a la lista al hacer clic en Volver', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /volver/i }))

    await waitFor(() =>
      expect(screen.getByText('Mis Escenarios')).toBeInTheDocument()
    )
  })

  // ── FAB ────────────────────────────────────────────────────────────────

  test('muestra el FAB (+) en la vista de lista', async () => {
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
      expect(screen.getByText(/nueva proyección/i)).toBeInTheDocument()
    )
  })

  // ── Eliminar ───────────────────────────────────────────────────────────

  test('abre modal de confirmación al eliminar desde el detalle', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    // ✅ texto exacto del botón
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /eliminar escenario/i })).toBeInTheDocument()
  )
  await user.click(screen.getByRole('button', { name: /eliminar escenario/i }))

  await waitFor(() =>
    expect(screen.getByText(/¿eliminar escenario\?/i)).toBeInTheDocument()
  )
  // Confirmar en el modal — este sí dice solo "Eliminar"
  await user.click(screen.getByRole('button', { name: /^eliminar$/i }))
  })

  test('llama a deleteProyeccion al confirmar', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    ;(deleteProyeccion as jest.Mock).mockResolvedValue(undefined)
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() =>
        expect(screen.getByRole('button', { name: /eliminar escenario/i })).toBeInTheDocument()
      )
      await user.click(screen.getByRole('button', { name: /eliminar escenario/i }))
    
      await waitFor(() =>
        expect(screen.getByText(/¿eliminar escenario\?/i)).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }))

    await waitFor(() =>
      expect(deleteProyeccion).toHaveBeenCalled()


    )
  })

  // ── Editar ─────────────────────────────────────────────────────────────

  test('abre el modal de edición con el título pre-llenado', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() =>
        expect(screen.getByRole('button', { name: /editar escenario/i })).toBeInTheDocument()
      )
      await user.click(screen.getByRole('button', { name: /editar escenario/i }))
    
      await waitFor(() =>
        expect(screen.getByText(/Editar proyección/i)).toBeInTheDocument()
      )
    

    await waitFor(() =>
      expect(screen.getByDisplayValue('Plan Nacional 2035')).toBeInTheDocument()
    )
  })

  test('el modal de edición NO llama a simularGeneral al abrirse', async () => {
    const user = userEvent.setup({ delay: null })
    ;(getProyecciones as jest.Mock).mockResolvedValue([mockProyeccion])
    renderPage()

    await waitFor(() => expect(screen.getByText('Plan Nacional 2035')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /^ver$/i }))
    await waitFor(() =>
        expect(screen.getByRole('button', { name: /editar escenario/i })).toBeInTheDocument()
      )

    jest.clearAllMocks()
    await user.click(screen.getByRole('button', { name: /editar escenario/i }))
    await waitFor(() => expect(screen.getByDisplayValue('Plan Nacional 2035')).toBeInTheDocument())

    expect(simularGeneral).not.toHaveBeenCalled()
  })

})