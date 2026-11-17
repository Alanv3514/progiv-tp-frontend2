import { useState } from 'react'
import type { SubmitEvent } from 'react'

interface Props {
  onSearch: (name: string) => void
  onClear: () => void
}

// Práctica 3: input + Buscar + Limpiar. Solo maneja el texto del input;
// quién hace el pedido es UsersPage.
export function SearchForm({ onSearch, onClear }: Props) {
  const [name, setName] = useState('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onSearch(trimmed)
    else onClear() // buscar vacío = ver todos
  }

  function handleClear() {
    setName('')
    onClear()
  }

  return (
    <form className="search" role="search" onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Buscar por nombre"
        aria-label="Buscar por nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn-primary" type="submit">
        Buscar
      </button>
      <button className="btn-secondary" type="button" onClick={handleClear}>
        Limpiar
      </button>
    </form>
  )
}
