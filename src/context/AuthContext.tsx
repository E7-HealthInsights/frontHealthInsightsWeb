import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UserProfile } from '../services/authService'

interface AuthContextType {
  user:     UserProfile | null
  setUser:  (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user:    null,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}