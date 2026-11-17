import { getAdults, getUsers, searchUsers } from '../api/users'
import type { NewUser, User } from '../api/types'

// Qué lista se está mostrando. La API no combina filtros: es una u otra.
export type ListView =
  | { kind: 'all' } // GET /user
  | { kind: 'search'; name: string } // GET /user/search/{name} (práctica 3)
  | { kind: 'adults' } // GET /user_mayores (práctica 6)

export const ALL: ListView = { kind: 'all' }
const ADULT_AGE = 18 // la API filtra age >= 18

export function fetchList(view: ListView): Promise<User[]> {
  switch (view.kind) {
    case 'all':
      return getUsers()
    case 'search':
      return searchUsers(view.name)
    case 'adults':
      return getAdults()
  }
}

export function sameView(a: ListView, b: ListView): boolean {
  if (a.kind === 'search' && b.kind === 'search') return a.name === b.name
  return a.kind === b.kind
}

// ¿Un usuario recién creado aparecería en esta lista si la volviéramos a pedir?
export function matchesView(user: NewUser, view: ListView): boolean {
  switch (view.kind) {
    case 'all':
      return true
    case 'search':
      return user.name.toLowerCase().includes(view.name.toLowerCase())
    case 'adults':
      return user.age >= ADULT_AGE
  }
}

export function emptyMessage(view: ListView): string {
  switch (view.kind) {
    case 'all':
      return 'No hay usuarios.'
    case 'search':
      return `No hay usuarios que coincidan con “${view.name}”.`
    case 'adults':
      return 'No hay usuarios mayores de edad.'
  }
}
