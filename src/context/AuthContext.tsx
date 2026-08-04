import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { UserRole } from '../types'
import type { GoogleAccount } from '../data/googleAccounts'

interface StoredSession {
  role: UserRole
  displayName: string
  email: string
}

interface AuthContextValue {
  role: UserRole | null
  displayName: string
  email: string
  login: (account: GoogleAccount) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'toshi-portal-session'

function readStoredSession(): StoredSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredSession
    if (parsed.role === 'admin' || parsed.role === 'editor' || parsed.role === 'staff') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession())

  const value = useMemo<AuthContextValue>(
    () => ({
      role: session?.role ?? null,
      displayName: session?.displayName ?? '',
      email: session?.email ?? '',
      login: (account: GoogleAccount) => {
        const next: StoredSession = { role: account.role, displayName: account.name, email: account.email }
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setSession(next)
      },
      logout: () => {
        sessionStorage.removeItem(STORAGE_KEY)
        setSession(null)
      },
    }),
    [session],
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
