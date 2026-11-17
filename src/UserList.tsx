import { useEffect, useState } from 'react'
import { formatRoles } from './format'
import type { User, UserDetail as UserDetailData } from './types'
import { SearchForm } from './SearchForm'
import { UserDetail } from './UserDetail'

// Base de los pasos 5 y 6 de la guía: lista de usuarios (GET /user)
// y saludo al usuario logueado (GET /user/me/id → GET /user/{id}).
export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true) // práctica 2
  const [error, setError] = useState<string | null>(null)
  // práctica 4: GET /user/{id} ya trae roles, así que me es el detalle completo
  const [me, setMe] = useState<UserDetailData | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null) // práctica 1
  const [query, setQuery] = useState('') // práctica 3: '' = todos

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL
    // encodeURIComponent: sin él, un '#' cortaría la URL ahí (lo toma como ancla)
    const url = query
      ? `${api}/user/search/${encodeURIComponent(query)}`
      : `${api}/user`
    let ignore = false // si cambia la búsqueda antes de que llegue, se descarta

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (ignore) return
        if (!response.ok) {
          setError(data.detail) // 401, 403, 404…: viene un objeto { detail }
          return
        }
        setUsers(data) // 200: recién acá es una lista
      })
      // fetch solo falla si no hubo respuesta (API caída, CORS, sin red)
      .catch(() => {
        if (!ignore) setError('No se pudo conectar con la API')
      })
      .finally(() => {
        if (!ignore) setLoading(false) // con éxito o con error, ya no carga
      })

    return () => {
      ignore = true
    }
  }, [token, query])

  // Buscar y Limpiar terminan acá: se cambia query y el useEffect vuelve a pedir.
  function applyQuery(newQuery: string) {
    if (newQuery === query) return // misma búsqueda: el efecto no se dispararía
    setLoading(true)
    setError(null)
    setQuery(newQuery)
  }

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
      <h1>
        Hola, {me?.name}
        {me && me.roles.length > 0 && ` (${formatRoles(me.roles)})`}
      </h1>
      <SearchForm onSearch={applyQuery} onClear={() => applyQuery('')} />
      {/* práctica 2: mientras carga o si hubo error, eso va en lugar de la lista */}
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p>
          {query ? `No hay usuarios que coincidan con “${query}”.` : 'No hay usuarios.'}
        </p>
      )}
      {!loading && !error && users.length > 0 && (
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
