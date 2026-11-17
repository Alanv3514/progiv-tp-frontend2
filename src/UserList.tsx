import { useEffect, useState } from 'react'
import { CreateUserForm } from './CreateUserForm'
import { formatRoles } from './format'
import type { NewUser, User, UserDetail as UserDetailData } from './types'
import { SearchForm } from './SearchForm'
import { UserDetail } from './UserDetail'

// Qué lista se está mostrando. La API no combina filtros: es una u otra.
type ListView =
  | { kind: 'all' } // GET /user
  | { kind: 'search'; name: string } // GET /user/search/{name} (práctica 3)
  | { kind: 'adults' } // GET /user_mayores (práctica 6)

const ALL: ListView = { kind: 'all' }
const ADULT_AGE = 18 // la API filtra age >= 18

function listUrl(view: ListView): string {
  const api = import.meta.env.VITE_API_URL
  switch (view.kind) {
    case 'all':
      return `${api}/user`
    case 'search':
      // encodeURIComponent: sin él, un '#' cortaría la URL ahí (lo toma como ancla)
      return `${api}/user/search/${encodeURIComponent(view.name)}`
    case 'adults':
      return `${api}/user_mayores`
  }
}

// ¿Un usuario recién creado aparecería en esta lista si la volviéramos a pedir?
function matchesView(user: NewUser, view: ListView): boolean {
  switch (view.kind) {
    case 'all':
      return true
    case 'search':
      return user.name.toLowerCase().includes(view.name.toLowerCase())
    case 'adults':
      return user.age >= ADULT_AGE
  }
}

function emptyMessage(view: ListView): string {
  switch (view.kind) {
    case 'all':
      return 'No hay usuarios.'
    case 'search':
      return `No hay usuarios que coincidan con “${view.name}”.`
    case 'adults':
      return 'No hay usuarios mayores de edad.'
  }
}

// Base de los pasos 5 y 6 de la guía: lista de usuarios (GET /user)
// y saludo al usuario logueado (GET /user/me/id → GET /user/{id}).
export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true) // práctica 2
  const [error, setError] = useState<string | null>(null)
  // práctica 4: GET /user/{id} ya trae roles, así que me es el detalle completo
  const [me, setMe] = useState<UserDetailData | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null) // práctica 1
  const [view, setView] = useState<ListView>(ALL) // prácticas 3 y 6

  useEffect(() => {
    let ignore = false // si cambia la vista antes de que llegue, se descarta

    fetch(listUrl(view), { headers: { Authorization: `Bearer ${token}` } })
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
  }, [token, view])

  // Buscar, Limpiar y Todos/Solo mayores terminan acá:
  // se cambia view y el useEffect vuelve a pedir.
  function changeView(newView: ListView) {
    if (listUrl(newView) === listUrl(view)) return // misma URL: el efecto no se dispararía
    setLoading(true)
    setError(null)
    setView(newView)
  }

  // práctica 5: el alta salió bien → se agrega a la lista sin volver a pedirla,
  // pero solo si entra en lo que se está mostrando.
  function handleCreated(user: NewUser) {
    if (!matchesView(user, view)) return
    setUsers((prev) => [...prev, { id: user.id, name: user.name }])
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
      <CreateUserForm token={token} onCreated={handleCreated} />
      <SearchForm
        onSearch={(name) => changeView({ kind: 'search', name })}
        onClear={() => changeView(ALL)}
      />
      {/* práctica 6: el botón muestra a qué lista se pasa */}
      <button
        type="button"
        onClick={() => changeView(view.kind === 'adults' ? ALL : { kind: 'adults' })}
      >
        {view.kind === 'adults' ? 'Todos' : 'Solo mayores'}
      </button>
      {/* práctica 2: mientras carga o si hubo error, eso va en lugar de la lista */}
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && users.length === 0 && <p>{emptyMessage(view)}</p>}
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
