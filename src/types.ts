// Tipos de las respuestas de la API (clase-1-sqlmodel).

// GET /user → cada elemento de la lista trae solo id y name.
export interface User {
  id: number
  name: string
}

export interface Role {
  id: number
  name: string
}

export interface Country {
  id: number
  name: string
}

// GET /user/{id} → el detalle completo de un usuario.
export interface UserDetail extends User {
  email: string
  age: number
  country: Country | null
  roles: Role[]
}
