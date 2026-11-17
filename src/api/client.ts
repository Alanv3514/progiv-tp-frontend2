// Paso 8: el único lugar que sabe hablar con la API.
// URL base, header del token, response.ok, mensaje de error y 401 se
// resuelven acá una sola vez (ver práctica 9 en el README).

const API_URL = import.meta.env.VITE_API_URL

// Un error con el código HTTP: cada pantalla decide qué hacer (403, 404...).
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
}

// Qué hacer cuando el token deja de servir (práctica 8). Lo registra App.
let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

// FastAPI manda { detail: 'texto' } en los HTTPException,
// pero en un 422 (body inválido) detail es una lista [{ loc, msg }].
function readDetail(text: string, status: number): string {
  try {
    const { detail } = JSON.parse(text)
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((e: { loc: unknown[]; msg: string }) => `${e.loc.at(-1)}: ${e.msg}`)
        .join('; ')
    }
  } catch {
    // La respuesta no era JSON: por ejemplo "Internal Server Error".
  }
  return text || `Error ${status}`
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}` // si cambia el header, es esta línea

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    // fetch solo falla si no hubo respuesta: la API está apagada, o respondió
    // un 500 sin headers CORS y el navegador no deja leerlo.
    throw new ApiError(0, 'No se pudo conectar con la API')
  }

  const text = await response.text()
  if (!response.ok) {
    // Con token, un 401 es una sesión vencida. Sin token, es un login fallido.
    if (response.status === 401 && token) onUnauthorized()
    throw new ApiError(response.status, readDetail(text, response.status))
  }
  return JSON.parse(text) as T
}
