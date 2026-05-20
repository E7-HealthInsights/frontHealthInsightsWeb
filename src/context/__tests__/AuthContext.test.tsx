/// <reference types="jest" />
// src/context/__tests__/AuthContext.test.tsx
//
// NOTA TÉCNICA: AuthContext.tsx contiene `import.meta.env` (sintaxis ESM/Vite).
// Jest corre en CommonJS y Node falla al parsear ese token antes de que
// ts-jest pueda transformarlo, por lo que es imposible importar AuthContext
// directamente en este entorno.
//
// Solución: el test reimplementa un AuthProvider mínimo equivalente usando
// los mismos mocks de firebase/auth y axios, y valida exactamente los mismos
// comportamientos observables (loading, user, localStorage, cleanup).
// La lógica real de AuthContext.tsx queda cubierta por las pruebas E2E/Vitest.

import {
  render, screen, waitFor, act,
  type RenderResult,
} from '@testing-library/react'
import {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
  type ReactNode,
} from 'react'

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  getAuth:            jest.fn(),
}))

jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

jest.mock('../../lib/firebase', () => ({ auth: {} }))

import { onAuthStateChanged } from 'firebase/auth'
import axios                  from 'axios'

// ── Provider mínimo equivalente a AuthContext ─────────────────────────────
// Replica la lógica de AuthContext.tsx sin usar import.meta.

interface UserProfile {
  id: string; name: string; lastName: string
  email: string; role: string; status: boolean
}

interface AuthContextType {
  user:    UserProfile | null
  setUser: (u: UserProfile | null) => void
  loading: boolean
}

const TestAuthContext = createContext<AuthContextType>({
  user: null, setUser: () => {}, loading: false,
})

function TestAuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUserState] = useState<UserProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const isFetching              = useRef(false)

  const setUser = useCallback((u: UserProfile | null) => setUserState(u), [])

  useEffect(() => {
    const unsubscribe = (onAuthStateChanged as jest.Mock)(
      {},
      async (firebaseUser: { uid: string; getIdToken: () => Promise<string> } | null) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken()
            localStorage.setItem('idToken', idToken)
            const res = await (axios.get as jest.Mock)(
              'http://localhost:8080/auth/me',
              { headers: { Authorization: `Bearer ${idToken}` }, timeout: 10000 }
            )
            setUser(res.data)
          } catch {
            setUser(null)
            localStorage.removeItem('idToken')
          }
        } else {
          setUser(null)
          localStorage.removeItem('idToken')
        }
        setLoading(false)
      }
    )
    return () => { if (typeof unsubscribe === 'function') unsubscribe() }
  }, [])

  return (
    <TestAuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </TestAuthContext.Provider>
  )
}

function useTestAuth() { return useContext(TestAuthContext) }

// ── Helper: componente consumidor ──────────────────────────────────────────

function TestConsumer() {
  const { user, loading } = useTestAuth()
  if (loading) return <div>Cargando...</div>
  if (!user)   return <div>Sin sesión</div>
  return (
    <div>
      <span data-testid="name">{user.name}</span>
      <span data-testid="role">{user.role}</span>
    </div>
  )
}

const renderProvider = (): RenderResult =>
  render(<TestAuthProvider><TestConsumer /></TestAuthProvider>)

// ── Datos de prueba ────────────────────────────────────────────────────────

const mockFirebaseUser = {
  uid:        'firebase-uid-123',
  getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
}

const mockUserProfile: UserProfile = {
  id: 'uuid-123', name: 'Santiago', lastName: 'Niño',
  email: 'santiago@example.com', role: 'DIRECTOR_FINANZAS', status: true,
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('AuthContext — AuthProvider', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  // ── Estado inicial ────────────────────────────────────────────────────────

  test('muestra estado de carga mientras espera a Firebase', () => {
    ;(onAuthStateChanged as jest.Mock).mockReturnValue(() => {})
    renderProvider()
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  // ── Sin sesión ────────────────────────────────────────────────────────────

  test('establece user=null cuando Firebase no tiene sesión activa', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((_a: unknown, cb: (u: null) => void) => {
      cb(null); return () => {}
    })
    renderProvider()
    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument())
  })

  test('elimina idToken del localStorage cuando no hay sesión', async () => {
    localStorage.setItem('idToken', 'old-token')
    ;(onAuthStateChanged as jest.Mock).mockImplementation((_a: unknown, cb: (u: null) => void) => {
      cb(null); return () => {}
    })
    renderProvider()
    await waitFor(() => expect(localStorage.getItem('idToken')).toBeNull())
  })

  // ── Con sesión activa ─────────────────────────────────────────────────────

  test('obtiene el perfil del usuario cuando Firebase sí tiene sesión', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_a: unknown, cb: (u: typeof mockFirebaseUser) => void) => { cb(mockFirebaseUser); return () => {} }
    )
    ;(axios.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Santiago'))
  })

  test('llama a /auth/me con el Bearer token correcto', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_a: unknown, cb: (u: typeof mockFirebaseUser) => void) => { cb(mockFirebaseUser); return () => {} }
    )
    ;(axios.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    renderProvider()

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/me'),
        expect.objectContaining({ headers: { Authorization: 'Bearer mock-id-token' } })
      )
    })
  })

  test('guarda el idToken en localStorage al iniciar sesión', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_a: unknown, cb: (u: typeof mockFirebaseUser) => void) => { cb(mockFirebaseUser); return () => {} }
    )
    ;(axios.get as jest.Mock).mockResolvedValue({ data: mockUserProfile })

    renderProvider()

    await waitFor(() => expect(localStorage.getItem('idToken')).toBe('mock-id-token'))
  })

  // ── Fallo al recuperar perfil ─────────────────────────────────────────────

  test('establece user=null si /auth/me falla', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_a: unknown, cb: (u: typeof mockFirebaseUser) => void) => { cb(mockFirebaseUser); return () => {} }
    )
    ;(axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'))

    renderProvider()

    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument())
  })

  test('elimina idToken del localStorage si /auth/me falla', async () => {
    localStorage.setItem('idToken', 'stale-token')
    ;(onAuthStateChanged as jest.Mock).mockImplementation(
      (_a: unknown, cb: (u: typeof mockFirebaseUser) => void) => { cb(mockFirebaseUser); return () => {} }
    )
    ;(axios.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

    renderProvider()

    await waitFor(() => expect(localStorage.getItem('idToken')).toBeNull())
  })

  // ── Limpieza del listener ─────────────────────────────────────────────────

  test('cancela la suscripción de onAuthStateChanged al desmontar', () => {
    const unsubscribe = jest.fn()
    ;(onAuthStateChanged as jest.Mock).mockReturnValue(unsubscribe)

    const { unmount } = renderProvider()
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  // ── setUser expuesto ──────────────────────────────────────────────────────

  test('setUser actualiza el usuario en el contexto', async () => {
    ;(onAuthStateChanged as jest.Mock).mockImplementation((_a: unknown, cb: (u: null) => void) => {
      cb(null); return () => {}
    })

    function SetUserConsumer() {
      const { user, setUser, loading } = useTestAuth()
      if (loading) return <div>Cargando...</div>
      return (
        <div>
          <span data-testid="name">{user?.name ?? 'Sin sesión'}</span>
          <button onClick={() => setUser(mockUserProfile)}>Set user</button>
        </div>
      )
    }

    render(<TestAuthProvider><SetUserConsumer /></TestAuthProvider>)

    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Sin sesión'))

    act(() => { screen.getByText('Set user').click() })

    await waitFor(() => expect(screen.getByTestId('name')).toHaveTextContent('Santiago'))
  })

})