import { useState } from 'react'
import type { SubmitEvent } from 'react'

interface Props {
  onSearch: (name: string) => void
  onClear: () => void
}

// Práctica 3: input + Buscar + Limpiar. Solo maneja el texto del input;
// quién hace el pedido es UserList.
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
    <form onSubmit={handleSubmit}>
      <input
        type="search"
        placeholder="Buscar por nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Buscar</button>
      <button type="button" onClick={handleClear}>
        Limpiar
      </button>
    </form>
  )
}
