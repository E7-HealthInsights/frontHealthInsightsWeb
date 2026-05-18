// src/services/__tests__/authService.test.ts

import { login, logout } from '../authService'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import api from '../../lib/api'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut:                    jest.fn(),
  getAuth:                    jest.fn(),
}))

jest.mock('../../lib/api', () => ({
  get: jest.fn(),
}))

jest.mock('../../lib/firebase', () => ({
  auth: {},
}))

// ── Datos de prueba ────────────────────────────────────────────────────────

const mockFirebaseUser = {
  uid:         'firebase-uid-123',
  getIdToken:  jest.fn().mockResolvedValue('mock-id-token'),
}

const mockUserProfile = {
  id:       'uuid-123',
  name:     'Santiago',
  lastName: 'Niño',
  email:    'santiago@example.com',
  role:     'DIRECTOR_FINANZAS',
  status:   true,
}

// ── Tests de login ─────────────────────────────────────────────────────────

describe('authService — login', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('login exitoso: devuelve el perfil del usuario', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockFirebaseUser,
    })
    ;(api.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    // Act
    const result = await login('santiago@example.com', 'password123')

    // Assert
    expect(result).toEqual(mockUserProfile)
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'santiago@example.com',
      'password123'
    )
  })

  test('login exitoso: obtiene el idToken del usuario de Firebase', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockFirebaseUser,
    })
    ;(api.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    // Act
    await login('santiago@example.com', 'password123')

    // Assert
    expect(mockFirebaseUser.getIdToken).toHaveBeenCalledTimes(1)
  })

  test('login exitoso: llama a /auth/me con el Bearer token correcto', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockFirebaseUser,
    })
    ;(api.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    // Act
    await login('santiago@example.com', 'password123')

    // Assert
    expect(api.get).toHaveBeenCalledWith('/auth/me', {
      headers: { Authorization: 'Bearer mock-id-token' },
    })
  })

  test('login fallido: lanza error si Firebase falla', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error('auth/wrong-password')
    )

    // Act & Assert
    await expect(login('wrong@example.com', 'wrongpass'))
      .rejects.toThrow('auth/wrong-password')
  })

  test('login fallido: lanza error si /auth/me responde 401 y hace signOut', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockFirebaseUser,
    })
    const axiosError = { isAxiosError: true, response: { status: 401 } }
    ;(api.get as jest.Mock).mockRejectedValue(axiosError)
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    // Act & Assert
    await expect(login('noAccess@example.com', 'password123'))
      .rejects.toThrow()
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  test('login fallido: lanza error genérico si el back falla con otro status', async () => {
    // Arrange
    ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: mockFirebaseUser,
    })
    const axiosError = { isAxiosError: true, response: { status: 500 } }
    ;(api.get as jest.Mock).mockRejectedValue(axiosError)
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    // Act & Assert
    await expect(login('santiago@example.com', 'password123'))
      .rejects.toThrow('Error al obtener tu perfil. Intenta de nuevo.')
  })

})

// ── Tests de logout ────────────────────────────────────────────────────────

describe('authService — logout', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('idToken', 'some-token')
  })

  test('logout: llama a signOut de Firebase', async () => {
    // Arrange
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    // Act
    await logout()

    // Assert
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  test('logout: elimina el idToken del localStorage', async () => {
    // Arrange
    ;(signOut as jest.Mock).mockResolvedValue(undefined)

    // Act
    await logout()

    // Assert
    expect(localStorage.getItem('idToken')).toBeNull()
  })

})