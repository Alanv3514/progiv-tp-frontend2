import type { Role } from '../api/types'

// [{ name: 'ADMIN' }, { name: 'REGULAR' }] → 'ADMIN, REGULAR'
export function formatRoles(roles: Role[]): string {
  return roles.map((role) => role.name).join(', ')
}

// 'Martina Gómez' → 'MG' (para el avatar)
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
