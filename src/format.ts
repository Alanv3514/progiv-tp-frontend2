import type { Role } from './types'

// [{ name: 'ADMIN' }, { name: 'REGULAR' }] → 'ADMIN, REGULAR'
export function formatRoles(roles: Role[]): string {
  return roles.map((role) => role.name).join(', ')
}

// FastAPI manda { detail: 'texto' } en los HTTPException,
// pero en un 422 (body inválido) detail es una lista [{ loc, msg }].
export function errorMessage(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item: { loc?: unknown[]; msg?: string }) =>
        item.loc ? `${item.loc.at(-1)}: ${item.msg}` : String(item.msg),
      )
      .join('; ')
  }
  return 'Error inesperado'
}
