import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn(password: string) {
    const email = import.meta.env.VITE_APP_LOGIN_EMAIL
    if (!isSupabaseConfigured || !email) return 'Configurazione Supabase incompleta.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? 'Password non valida.' : null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ loading, session, signIn, signOut }}>{children}</AuthContext.Provider>
}
