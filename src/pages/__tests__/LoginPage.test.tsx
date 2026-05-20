/// <reference types="jest" />
// src/pages/__tests__/LoginPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react'
import userEvent                   from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginPage                   from '../LoginPage'
import { login }                   from '../../services/authService'
import { useAuth }                 from '../../context/AuthContext'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../services/authService', () => ({
  login: jest.fn(),
}))

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
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

const mockUserProfile = {
  id:       'uuid-123',
  name:     'Santiago',
  lastName: 'Niño',
  email:    'santiago@example.com',
  role:     'DIRECTOR_FINANZAS',
  status:   true,
}

// ── Helper ─────────────────────────────────────────────────────────────────

const renderLoginPage = (authOverrides = {}) => {
  const mockSetUser = jest.fn()

  ;(useAuth as jest.Mock).mockReturnValue({
    user:    null,
    setUser: mockSetUser,
    loading: false,
    ...authOverrides,
  })

  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )

  return { mockSetUser }
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('LoginPage', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── Renderizado ───────────────────────────────────────────────────────────

  test('renderiza el formulario de inicio de sesión', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText(/correo@ejemplo\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  test('no muestra error al montar', () => {
    renderLoginPage()
    expect(screen.queryByText(/correo o contraseña incorrectos/i)).not.toBeInTheDocument()
  })

  // ── Login exitoso ─────────────────────────────────────────────────────────

  test('login exitoso: llama a login con email y password correctos', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockResolvedValue(mockUserProfile)
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('santiago@example.com', 'password123')
    })
  })

  test('login exitoso: llama a setUser con el perfil devuelto', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockResolvedValue(mockUserProfile)
    const { mockSetUser } = renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(mockUserProfile)
    })
  })

  test('login exitoso: navega a / después del login', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockResolvedValue(mockUserProfile)
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  // ── Estado loading ────────────────────────────────────────────────────────

  test('deshabilita el botón mientras el login está en curso', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockImplementation(() => new Promise(() => {}))
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(screen.getByRole('button', { name: /ingresar/i })).toBeDisabled()
  })

  test('reactiva el botón si el login falla', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockRejectedValue(new Error('auth/wrong-password'))
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /ingresar/i })).not.toBeDisabled()
    })
  })

  // ── Manejo de errores ─────────────────────────────────────────────────────

  test('muestra mensaje amigable si Firebase rechaza las credenciales', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockRejectedValue(new Error('auth/invalid-credential'))
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'wrong@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/correo o contraseña incorrectos/i)).toBeInTheDocument()
    })
  })

  test('muestra mensaje de sin acceso cuando el back rechaza con 401', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockRejectedValue(new Error('Tu cuenta no tiene acceso a esta plataforma.'))
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'noAccess@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/tu cuenta no tiene acceso/i)).toBeInTheDocument()
    })
  })

  test('muestra error genérico ante errores del servidor', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockRejectedValue(new Error('Error al obtener tu perfil. Intenta de nuevo.'))
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/error al obtener tu perfil/i)).toBeInTheDocument()
    })
  })

  test('muestra "error inesperado" si se lanza un valor que no es Error', async () => {
    const user = userEvent.setup({ delay: null })
    ;(login as jest.Mock).mockRejectedValue('fallo raro')
    renderLoginPage()

    await user.type(screen.getByPlaceholderText(/correo@ejemplo\.com/i), 'santiago@example.com')
    await user.type(screen.getByPlaceholderText(/••••••••/i), 'password123')
    await user.click(screen.getByRole('button', { name: /ingresar/i }))

    await waitFor(() => {
      expect(screen.getByText(/ocurrió un error inesperado/i)).toBeInTheDocument()
    })
  })

  // ── Redirección si ya hay sesión ──────────────────────────────────────────

  test('redirige a / si el usuario ya está autenticado', () => {
    renderLoginPage({ user: mockUserProfile, loading: false })
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  test('no redirige mientras authLoading sigue en true', () => {
    renderLoginPage({ user: null, loading: true })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

})