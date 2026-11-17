import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { UserList } from './UserList'

// Base de los pasos 1 a 7 de la guía: login contra POST /login,
// token guardado en localStorage y botón Salir.
export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault() // sin esto, el navegador recarga la página
    setError(null)
    const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.detail) // 401: "User/password incorrect"
      return
    }
    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (token) {
    return (
      <>
        <button type="button" onClick={logout}>
          Salir
        </button>
        <UserList token={token} />
      </>
    )
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
      {error && <p>{error}</p>}
    </form>
  )
}
