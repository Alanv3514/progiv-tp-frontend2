import { getUser } from '../api/users'
import { useFetch } from '../hooks/useFetch'
import { formatRoles } from '../utils/format'

// Práctica 1: detalle de un usuario. useFetch vuelve a pedir si cambia userId.
export function UserDetail({ userId }: { userId: number }) {
  const { data: user, error } = useFetch(() => getUser(userId), [userId])

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
