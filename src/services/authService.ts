// src/services/authService.ts
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export interface UserProfile {
  id:       number
  name:     string
  lastName: string
  email:    string
  role:     string
  status:   boolean
}

/**
 * 1. Autentica con Firebase (valida email/password)
 * 2. Obtiene el idToken JWT
 * 3. Llama a Quarkus con ese token
 * 4. Devuelve el perfil del usuario desde BD
 */
export async function login(email: string, password: string): Promise<UserProfile> {
  const credential = await signInWithEmailAndPassword(auth, email, password)

  const idToken = await credential.user.getIdToken()

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type':  'application/json',
    },
  })

  if (!response.ok) {
    // Si el back responde 401, el usuario existe en Firebase pero no en la BD
    if (response.status === 401) {
      await signOut(auth) // limpiamos la sesión de Firebase
      throw new Error('Tu cuenta no tiene acceso a esta plataforma.')
    }
    throw new Error('Error al obtener tu perfil. Intenta de nuevo.')
  }

  return response.json() as Promise<UserProfile>
}

export async function logout(): Promise<void> {
  await signOut(auth)
}