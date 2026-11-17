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

// Lo que CreateUserForm avisa al crear: id (de la API) + datos del form.
export interface NewUser extends User {
  age: number
}

// GET /user/{id} → el detalle completo de un usuario.
export interface UserDetail extends User {
  email: string
  age: number
  country: Country | null
  roles: Role[]
}
