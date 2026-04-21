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
  const credential = await signInWithEmailAndPassword(auth, email, password)

  const idToken = await credential.user.getIdToken()

  try {
    const response = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    return response.data

  } catch (error) {
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