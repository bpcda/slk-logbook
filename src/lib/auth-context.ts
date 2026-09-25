import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthValue = {
  loading: boolean
  session: Session | null
  signIn: (password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider mancante')
  return value
}

