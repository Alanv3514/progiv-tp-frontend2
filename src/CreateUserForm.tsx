import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { errorMessage } from './format'
import type { NewUser } from './types'

interface Props {
  token: string
  onCreated: (user: NewUser) => void
  onUnauthorized: () => void
}

// No hay endpoint de países: las opciones van escritas a mano.
const COUNTRIES = [
  { id: 1, name: 'Argentina' },
  { id: 2, name: 'Brasil' },
]

const EMPTY_FORM = { name: '', age: '', email: '', password: '', countryId: '1' }

// Práctica 5: alta de usuario (POST /user).
export function CreateUserForm({ token, onCreated, onUnauthorized }: Props) {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          age: Number(form.age), // los inputs siempre dan texto
          email: form.email,
          password: form.password,
          country_id: Number(form.countryId),
        }),
      })
      if (response.status === 401) return onUnauthorized() // práctica 8
      const data = await response.json()
      if (!response.ok) {
        setError(errorMessage(data.detail)) // con sfer: Missing permission: write_users
        return
      }
      // la API devuelve solo { id }; el resto sale del form
      onCreated({ id: data.id, name: form.name, age: Number(form.age) })
      setSuccess(`Usuario ${form.name} creado`)
      setForm(EMPTY_FORM)
    } catch {
      setError('No se pudo conectar con la API')
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
