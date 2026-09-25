import { useState, type FormEvent } from 'react'
import { useAuth } from '../lib/auth-context'

export function LoginPage() {
  const { signIn } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError((await signIn(password)) ?? '')
    setSubmitting(false)
  }

  return <main className="login-page">
    <form className="login-card" onSubmit={(event) => void submit(event)}>
      <h1>SLK Logbook</h1>
      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={submitting}>{submitting ? 'Accesso…' : 'Accedi'}</button>
    </form>
  </main>
}
