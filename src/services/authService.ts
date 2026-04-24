import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import axios from 'axios'
import { auth } from '../lib/firebase'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export interface UserProfile {
  id:       string
  name:     string
  lastName: string
  email:    string
  role:     string
  status:   boolean
}

export async function login(email: string, password: string): Promise<UserProfile> {
  console.log('[login] ▶️  start', { email, API_URL })

  console.log('[login] 1/3 signInWithEmailAndPassword…')
  const credential = await signInWithEmailAndPassword(auth, email, password)
  console.log('[login] 1/3 ✅ firebase uid:', credential.user.uid)

  console.log('[login] 2/3 getIdToken…')
  const idToken = await credential.user.getIdToken()
  console.log('[login] 2/3 ✅ idToken length:', idToken.length)

  try {
    console.log('[login] 3/3 GET', `${API_URL}/auth/me`)
    const response = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      timeout: 10000,
    })
    console.log('[login] 3/3 ✅ /auth/me response:', response.status, response.data)
    return response.data

  } catch (error) {
    console.error('[login] 3/3 ❌ /auth/me failed:', error)
    if (axios.isAxiosError(error)) {
      console.error('[login]    status:', error.response?.status, 'data:', error.response?.data, 'code:', error.code)
    }
    await signOut(auth) // limpiamos sesión de Firebase si el back falla
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('Tu cuenta no tiene acceso a esta plataforma.')
    }
    throw new Error('Error al obtener tu perfil. Intenta de nuevo.')
  }
}

export async function logout(): Promise<void> {
  await signOut(auth)
  localStorage.removeItem('idToken')
}