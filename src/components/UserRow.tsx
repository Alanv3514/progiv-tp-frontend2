import type { User } from '../api/types'

interface Props {
  user: User
  deleting: boolean
  onSelect: (id: number) => void
  onDelete: (user: User) => void
}

// Una fila de la lista: el nombre (práctica 1) y el botón Borrar (práctica 7).
export function UserRow({ user, deleting, onSelect, onDelete }: Props) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(user.id)}>
        {user.name}
      </button>{' '}
      <button type="button" onClick={() => onDelete(user)} disabled={deleting}>
        {deleting ? 'Borrando...' : 'Borrar'}
      </button>
    </li>
  )
}
