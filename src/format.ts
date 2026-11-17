import type { Role } from './types'

// [{ name: 'ADMIN' }, { name: 'REGULAR' }] → 'ADMIN, REGULAR'
export function formatRoles(roles: Role[]): string {
  return roles.map((role) => role.name).join(', ')
}
