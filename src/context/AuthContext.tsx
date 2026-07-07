import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UserRole } from '../types'

interface AuthContextValue {
  role: UserRole | null
  displayName: string
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'toshi-portal-role'

function readStoredRole(): UserRole | null {
  const value = sessionStorage.getItem(STORAGE_KEY)
  return value === 'admin' || value === 'staff' ? value : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => readStoredRole())

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      displayName: role === 'admin' ? '管理者' : role === 'staff' ? '現場社員' : '',
      login: (nextRole: UserRole) => {
        sessionStorage.setItem(STORAGE_KEY, nextRole)
        setRole(nextRole)
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY)
        setRole(null)
      },
    }),
    [role],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth は AuthProvider の内側で使用してください')
  }
  return ctx
}
