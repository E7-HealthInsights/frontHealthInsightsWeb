import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import axios from 'axios'
import { auth } from '../lib/firebase'

const API_URL = import.meta.env.VITE_API_URL

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
    console.log('[login] 3/3 GET', `${API_URL}/auth/me`)
    const response = await axios.get<UserProfile>(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      timeout: 10000,
    })
    

    if (response.data.status === false) {
      console.warn('[login] usuario inactivo, cerrando sesión de Firebase')
      await signOut(auth)
      localStorage.removeItem('idToken')
      throw new Error('Tu cuenta está inactiva. Contacta al administrador.')
    }

    return response.data

  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Tu cuenta está inactiva')) {
      throw error
    }
    
    if (axios.isAxiosError(error)) {
      console.error('[login]    status:', error.response?.status,
          'data:', error.response?.data, 'code:', error.code)
    }
    await signOut(auth)
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
