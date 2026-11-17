import { useEffect, useState } from 'react'
import { setUnauthorizedHandler } from './api/client'
import { LoginPage } from './pages/LoginPage'
import { UsersPage } from './pages/UsersPage'

// La sesión: token en localStorage, Salir y qué pasa cuando vence.
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [notice, setNotice] = useState<string | null>(null)

  // Práctica 8 con el paso 8: apiFetch avisa de cualquier 401 desde un solo
  // lugar, así que ya no hace falta pasar onUnauthorized de prop en prop.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('token')
      setToken(null)
      setNotice('Tu sesión venció')
    })
  }, [])

  function handleLogin(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setNotice(null)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) return <LoginPage notice={notice} onLogin={handleLogin} />

  return (
    <>
      <button type="button" onClick={logout}>
        Salir
      </button>
      <UsersPage />
    </>
  )
}
