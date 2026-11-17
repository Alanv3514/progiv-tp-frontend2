import { useState } from 'react'
import { deleteUser, getMe } from '../api/users'
import type { NewUser, User } from '../api/types'
import { CreateUserForm } from '../components/CreateUserForm'
import { SearchForm } from '../components/SearchForm'
import { UserDetail } from '../components/UserDetail'
import { UserRow } from '../components/UserRow'
import { useFetch } from '../hooks/useFetch'
import { formatRoles } from '../utils/format'
import { ALL, emptyMessage, fetchList, matchesView, sameView } from '../utils/listView'
import type { ListView } from '../utils/listView'

// Pantalla principal: saludo (prácticas 4), alta (5), búsqueda (3),
// Todos/Solo mayores (6), lista con borrar (2 y 7) y detalle (1).
export function UsersPage() {
  const [view, setView] = useState<ListView>(ALL)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: me } = useFetch(getMe, [])
  // Un solo pedido que depende de la vista: si cambia, se pide de nuevo.
  const { data: users, error, loading, setData: setUsers } = useFetch(
    () => fetchList(view),
    [view],
  )

  function changeView(newView: ListView) {
    if (sameView(newView, view)) return
    setDeleteError(null)
    setView(newView)
  }

  // Alta: se agrega a la lista sin volver a pedirla, si entra en la vista actual.
  function handleCreated(user: NewUser) {
    if (!matchesView(user, view)) return
    setUsers((prev) => [...(prev ?? []), { id: user.id, name: user.name }])
  }

  // Borrar: confirmación y se saca con filter sin volver a pedir la lista.
  async function handleDelete(user: User) {
    if (!window.confirm(`¿Borrar a ${user.name}?`)) return
    setDeleteError(null)
    setDeletingId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((prev) => (prev ?? []).filter((u) => u.id !== user.id))
      if (selectedId === user.id) setSelectedId(null)
    } catch (e) {
      setDeleteError((e as Error).message) // con sfer: Missing permission: delete_users
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <h1>
        Hola, {me?.name}
        {me && me.roles.length > 0 && ` (${formatRoles(me.roles)})`}
      </h1>
      <CreateUserForm onCreated={handleCreated} />
      <SearchForm
        onSearch={(name) => changeView({ kind: 'search', name })}
        onClear={() => changeView(ALL)}
      />
      <button
        type="button"
        onClick={() => changeView(view.kind === 'adults' ? ALL : { kind: 'adults' })}
      >
        {view.kind === 'adults' ? 'Todos' : 'Solo mayores'}
      </button>
      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}
      {deleteError && <p>{deleteError}</p>}
      {!loading && !error && users?.length === 0 && <p>{emptyMessage(view)}</p>}
      {!loading && !error && users && users.length > 0 && (
        <ul>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              deleting={deletingId === user.id}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
      {selectedId !== null && <UserDetail key={selectedId} userId={selectedId} />}
    </>
  )
}
