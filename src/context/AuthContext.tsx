import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import axios from 'axios'
import { auth } from '../lib/firebase'
import type { UserProfile } from '../services/authService'

interface AuthContextType {
  user:     UserProfile | null
  setUser:  (user: UserProfile | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  setUser: () => {},
  loading: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)  //true al inicio, se vuelve false tras intentar cargar sesión

  // Al montar el provider, se suscribe a cambios de autenticación en Firebase
  useEffect(() => {
    console.log('[AuthContext] subscribing onAuthStateChanged…')
    // Firebase notifica si hay sesión activa al cargar la app
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] onAuthStateChanged →', firebaseUser?.uid ?? 'null')
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          localStorage.setItem('idToken', idToken)   // renueva si expiró
          const url = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/auth/me`
          console.log('[AuthContext] GET', url)
          const res = await axios.get<UserProfile>(
            url,
            { headers: { Authorization: `Bearer ${idToken}` }, timeout: 10000 }
          )
          console.log('[AuthContext] /auth/me ✅', res.status, res.data)
          setUser(res.data)
        } catch (err) {
          console.error('[AuthContext] /auth/me ❌', err)
          setUser(null)
          localStorage.removeItem('idToken')
        }
      } else {
        setUser(null)
        localStorage.removeItem('idToken')
      }
      console.log('[AuthContext] setLoading(false)')
      setLoading(false)   // ya sabe si hay sesión o no
    })

    return () => unsubscribe()   // limpia el listener al desmontar
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}