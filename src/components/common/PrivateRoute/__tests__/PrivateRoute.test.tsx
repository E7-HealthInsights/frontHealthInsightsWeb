/// <reference types="jest" />
// src/components/common/PrivateRoute/__tests__/PrivateRoute.test.tsx

import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes }   from 'react-router-dom'
import PrivateRoute                      from '../PrivateRoute'
import { useAuth }                       from '../../../../context/AuthContext'
import { logout }                        from '../../../../services/authService'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('../../../../services/authService', () => ({
  logout: jest.fn(),
}))

// Mockeamos solo useNavigate — NO usamos requireActual(react-router-dom)
// porque react-router v7 usa TextEncoder al cargarse, que jsdom no soporta.
// MemoryRouter (importado directamente) sí funciona porque se carga distinto.
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ── Datos de prueba ────────────────────────────────────────────────────────

const mockAdminUser = {
  id:       'uuid-admin',
  name:     'Admin',
  lastName: 'Test',
  email:    'admin@test.com',
  role:     'ADMIN',
  status:   true,
}

const mockDirectorUser = {
  ...mockAdminUser,
  id:   'uuid-director',
  role: 'DIRECTOR_FINANZAS',
}

// ── Helper ─────────────────────────────────────────────────────────────────

interface RenderOptions {
  initialPath?:   string
  authOverrides?: Record<string, unknown>
}

const renderWithRouter = ({ initialPath = '/', authOverrides = {} }: RenderOptions = {}) => {
  ;(useAuth as jest.Mock).mockReturnValue({
    user:    null,
    setUser: jest.fn(),
    loading: false,
    ...authOverrides,
  })

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route element={<PrivateRoute />}>
          <Route path="/"      element={<div>Dashboard</div>} />
          <Route path="/admin" element={<div>Admin Panel</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PrivateRoute', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // ── Estado loading ────────────────────────────────────────────────────────

  test('no muestra el contenido protegido mientras loading es true', () => {
    renderWithRouter({ authOverrides: { loading: true } })
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  // ── Sin sesión → redirige a /login ────────────────────────────────────────

  test('redirige a /login si no hay usuario autenticado', () => {
    renderWithRouter({ authOverrides: { user: null, loading: false } })
    expect(screen.getByText('Página de Login')).toBeInTheDocument()
  })

  test('no muestra el contenido protegido si no hay sesión', () => {
    renderWithRouter({ authOverrides: { user: null, loading: false } })
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  // ── Con sesión → muestra el Outlet ───────────────────────────────────────

  test('muestra el contenido protegido si hay usuario autenticado', () => {
    renderWithRouter({ authOverrides: { user: mockDirectorUser, loading: false } })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  test('no redirige a /login si hay usuario autenticado', () => {
    renderWithRouter({ authOverrides: { user: mockDirectorUser, loading: false } })
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument()
  })

  // ── Control de acceso por rol ─────────────────────────────────────────────

  test('permite acceso a /admin si el rol es ADMIN', () => {
    renderWithRouter({
      initialPath:   '/admin',
      authOverrides: { user: mockAdminUser, loading: false },
    })
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  test('redirige si el rol no tiene acceso a la ruta', () => {
    renderWithRouter({
      initialPath:   '/admin',
      authOverrides: { user: mockDirectorUser, loading: false },
    })
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
  })

  // ── Cierre de sesión por inactividad ──────────────────────────────────────

  test('cierra sesión automáticamente después de 12 h de inactividad', async () => {
    ;(logout as jest.Mock).mockResolvedValue(undefined)

    renderWithRouter({ authOverrides: { user: mockDirectorUser, loading: false } })

    act(() => {
      jest.advanceTimersByTime(12 * 60 * 60 * 1000 + 1)
    })

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
    })
  })

  test('navega a /login con mensaje al expirar la sesión por inactividad', async () => {
    ;(logout as jest.Mock).mockResolvedValue(undefined)

    renderWithRouter({ authOverrides: { user: mockDirectorUser, loading: false } })

    act(() => {
      jest.advanceTimersByTime(12 * 60 * 60 * 1000 + 1)
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        expect.objectContaining({
          replace: true,
          state:   expect.objectContaining({ message: expect.stringContaining('expiró') }),
        })
      )
    })
  })

  test('reinicia el timer al detectar actividad del usuario', () => {
    ;(logout as jest.Mock).mockResolvedValue(undefined)

    renderWithRouter({ authOverrides: { user: mockDirectorUser, loading: false } })

    // 11 h → actividad → 11 h más (< 12 h desde el último evento)
    act(() => { jest.advanceTimersByTime(11 * 60 * 60 * 1000) })
    act(() => { window.dispatchEvent(new Event('mousemove')) })
    act(() => { jest.advanceTimersByTime(11 * 60 * 60 * 1000) })

    expect(logout).not.toHaveBeenCalled()
  })

  // ── Limpieza de listeners ─────────────────────────────────────────────────

  test('cancela el timer al desmontar el componente', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    const { unmount } = renderWithRouter({
      authOverrides: { user: mockDirectorUser, loading: false },
    })

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  test('no dispara logout si no hay usuario autenticado', () => {
    ;(logout as jest.Mock).mockResolvedValue(undefined)

    renderWithRouter({ authOverrides: { user: null, loading: false } })

    act(() => { jest.advanceTimersByTime(12 * 60 * 60 * 1000 + 1) })

    expect(logout).not.toHaveBeenCalled()
  })

})