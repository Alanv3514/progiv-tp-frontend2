import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { COUNTRIES, createUser } from '../api/users'
import type { NewUser } from '../api/types'

interface Props {
  onCreated: (user: NewUser) => void
}

const EMPTY_FORM = { name: '', age: '', email: '', password: '', countryId: '1' }

// Práctica 5: alta de usuario (POST /user).
export function CreateUserForm({ onCreated }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSending(true)
    try {
      const age = Number(form.age) // los inputs siempre dan texto
      const { id } = await createUser({
        name: form.name,
        age,
        email: form.email,
        password: form.password,
        country_id: Number(form.countryId),
      })
      // la API devuelve solo { id }; el resto sale del form
      onCreated({ id, name: form.name, age })
      setSuccess(`Usuario ${form.name} creado`)
      setForm(EMPTY_FORM)
    } catch (e) {
      setError((e as Error).message) // con sfer: Missing permission: write_users
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo usuario</h2>
      <input
        placeholder="Nombre"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Edad"
        min={0}
        value={form.age}
        onChange={(e) => update('age', e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        minLength={4}
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        required
      />
      <select
        value={form.countryId}
        onChange={(e) => update('countryId', e.target.value)}
      >
        {COUNTRIES.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name}
          </option>
        ))}
      </select>
      <button type="submit" disabled={sending}>
        {sending ? 'Creando...' : 'Crear'}
      </button>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </form>
  )
}
