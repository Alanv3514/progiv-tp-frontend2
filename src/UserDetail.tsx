import { useEffect, useState } from 'react'
import { errorMessage, formatRoles } from './format'
import type { UserDetail as UserDetailData } from './types'

interface Props {
  token: string
  userId: number
  onUnauthorized: () => void
}

// Práctica 1: detalle de un usuario (GET /user/{id}).
// El useEffect depende de userId: cada vez que se elige otro, se vuelve a pedir.
export function UserDetail({ token, userId, onUnauthorized }: Props) {
  const [user, setUser] = useState<UserDetailData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si se elige otro usuario antes de que llegue la respuesta,
    // ignoramos la vieja para no mostrar datos de otro.
    // (UserList lo monta con key={userId}, así arranca con el estado limpio.)
    let ignore = false

    fetch(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (ignore) return
        if (response.status === 401) return onUnauthorized() // práctica 8
        if (!response.ok) {
          setError(errorMessage(data.detail))
          return
        }
        setUser(data)
      })
      .catch(() => {
        if (!ignore) setError('No se pudo conectar con la API')
      })

    return () => {
      ignore = true
    }
  }, [token, userId, onUnauthorized])

  if (error) return <p>{error}</p>
  if (!user) return null

  return (
    <section>
      <h2>{user.name}</h2>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Edad</dt>
        <dd>{user.age}</dd>
        <dt>País</dt>
        <dd>{user.country?.name ?? '—'}</dd>
        <dt>Roles</dt>
        <dd>{formatRoles(user.roles) || '—'}</dd>
      </dl>
    </section>
  )
}
