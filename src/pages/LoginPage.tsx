import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { login } from '../api/auth'

interface Props {
  notice: string | null // por ejemplo "Tu sesión venció" (práctica 8)
  onLogin: (token: string) => void
}

// Login contra POST /login (pasos 1 a 4 de la guía).
export function LoginPage({ notice, onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault() // sin esto, el navegador recarga la página
    setError(null)
    try {
      const { token } = await login(email, password)
      onLogin(token)
    } catch (e) {
      setError((e as Error).message) // 401: "User/password incorrect"
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Ingresar</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Ingresar</button>
      {(error ?? notice) && <p>{error ?? notice}</p>}
    </form>
  )
}
