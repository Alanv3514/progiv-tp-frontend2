import { useEffect, useState } from 'react'
import type { User } from './types'
import { UserDetail } from './UserDetail'

// Base de los pasos 5 y 6 de la guía: lista de usuarios (GET /user)
// y saludo al usuario logueado (GET /user/me/id → GET /user/{id}).
export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true) // práctica 2
  const [error, setError] = useState<string | null>(null)
  const [me, setMe] = useState<User | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null) // práctica 1

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          setError(data.detail) // 401, 403, 404…: viene un objeto { detail }
          return
        }
        setUsers(data) // 200: recién acá es una lista
      })
      // fetch solo falla si no hubo respuesta (API caída, CORS, sin red)
      .catch(() => setError('No se pudo conectar con la API'))
      .finally(() => setLoading(false)) // con éxito o con error, ya no carga
  }, [token])

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` }
    const api = import.meta.env.VITE_API_URL
    fetch(`${api}/user/me/id`, { headers }) // 1) ¿quién soy? → { id }
      .then((response) => response.json())
      .then(({ id }) => fetch(`${api}/user/${id}`, { headers })) // 2) mis datos
      .then((response) => response.json())
      .then(setMe)
  }, [token])

  return (
    <>
      <h1>Hola, {me?.name}</h1>
      {/* práctica 2: mientras carga o si hubo error, eso va en lugar de la lista */}
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <button type="button" onClick={() => setSelectedId(user.id)}>
                {user.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {selectedId !== null && (
        <UserDetail key={selectedId} token={token} userId={selectedId} />
      )}
    </>
  )
}
