// Lo que viaja por HTTP. Copia de los modelos de api/model/*.py del backend.

export interface LoginResponse { // POST /login
  msg: string
  token: string
}

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

export interface UserPayload { // body de POST /user
  name: string
  age: number
  email: string
  password: string
  country_id: number
}

export interface CreatedResponse { // POST /user
  id: number
}

export interface MessageResponse { // DELETE /user/{id}
  msg: string
}

// Lo que CreateUserForm avisa al crear: id (de la API) + datos del form.
export interface NewUser extends User {
  age: number
}
